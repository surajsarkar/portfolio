/** Public contact target shown on the site. */
export const CONTACT_EMAIL = 'hello@surajsarkar.dev';

export type ContactPayload = {
  email: string;
  message: string;
  /** Honeypot — must stay empty. */
  botcheck?: string;
};

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/**
 * Send a contact message from a static site (e.g. GitHub Pages).
 *
 * Prefer Web3Forms when `VITE_WEB3FORMS_ACCESS_KEY` is set (recommended).
 * Get a free key at https://web3forms.com — it is safe to expose in the frontend.
 *
 * Falls back to FormSubmit using CONTACT_EMAIL (one-time email confirmation required).
 */
export async function sendContactMessage(payload: ContactPayload): Promise<ContactResult> {
  const email = payload.email.trim();
  const message = payload.message.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }
  if (message.length < 3) {
    return { ok: false, message: 'Please write a short message.' };
  }
  // Honeypot filled → pretend success, drop the request
  if (payload.botcheck) {
    return { ok: true, message: 'Message sent.' };
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

  try {
    if (accessKey) {
      return await sendViaWeb3Forms({ email, message, accessKey });
    }
    return await sendViaFormSubmit({ email, message });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Something went wrong.';
    return { ok: false, message: detail };
  }
}

async function sendViaWeb3Forms(args: {
  email: string;
  message: string;
  accessKey: string;
}): Promise<ContactResult> {
  // Web3Forms free plan expects a browser/client submit.
  // Destination inbox is the email used when creating this access_key — not a form field.
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: args.accessKey,
      subject: `Portfolio contact from ${args.email}`,
      from_name: 'Portfolio contact form',
      name: args.email,
      email: args.email,
      replyto: args.email,
      message: args.message,
    }),
  });

  const data = (await res.json()) as { success?: boolean; message?: string };

  if (!res.ok || !data.success) {
    return {
      ok: false,
      message: data.message || 'Could not send your message. Try again or email me directly.',
    };
  }

  return {
    ok: true,
    message:
      'Message transmitted. Check the inbox you used to create the Web3Forms key (and spam/promotions).',
  };
}

async function sendViaFormSubmit(args: {
  email: string;
  message: string;
}): Promise<ContactResult> {
  const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: args.email,
      message: args.message,
      _subject: `Portfolio contact from ${args.email}`,
      _template: 'table',
      _captcha: false,
      _replyto: args.email,
    }),
  });

  const data = (await res.json()) as {
    success?: boolean | string;
    message?: string;
  };

  // FormSubmit returns success: "false" as a string on some errors
  const succeeded = data.success === true || data.success === 'true';

  if (!res.ok || !succeeded) {
    return {
      ok: false,
      message:
        data.message ||
        'Could not send your message. Try again or email me directly.',
    };
  }

  // First-time FormSubmit activation still returns success with an activation note
  if (data.message && /activate|confirm/i.test(data.message)) {
    return {
      ok: true,
      message:
        'Almost there — check your inbox to activate the contact form (one-time). Then try again.',
    };
  }

  return { ok: true, message: 'Message transmitted. I will get back to you.' };
}
