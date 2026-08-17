# Suraj Sarkar - Portfolio

Personal portfolio website for Suraj Sarkar, showcasing work in backend systems, AI infrastructure, and production intelligence.

Live site: [https://surajsarkar.github.io/portfolio/](https://surajsarkar.github.io/portfolio/)

## 🚀 Tech Stack

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + Vanilla CSS (for custom GPU-friendly effects)
- **Animations:** GSAP (ScrollTrigger for scroll-based reveals)
- **3D / WebGL:** Three.js (for the interactive cosmic background and orbital objects)

## ✨ Features

- **Interactive Cosmic Background:** A WebGL-powered 3D starfield that responds to mouse movement and scrolls dynamically along the Z-axis.
- **Dynamic Skill Toolchain:** An orbital SVG and DOM-based visualization representing proficiency across languages, infrastructure, storage, and intelligence.
- **Performance Optimized:** Uses `prefers-reduced-motion` fallbacks, device-memory checks for scaling down WebGL star counts on mobile, and capped pixel ratios for battery efficiency.
- **Responsive Design:** Fluid typography using CSS `clamp()` and fully optimized for mobile devices with edge-to-edge touch targets.

## 💻 Local Development

**Prerequisites:**  Node.js (v20 or higher)

1. Clone the repository:
   ```bash
   git clone https://github.com/surajsarkar/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Build & Deployment

The site is configured to deploy automatically to GitHub Pages using GitHub Actions whenever changes are pushed to the `main` branch.

To build the site manually for production:
```bash
npm run build
```
This will generate the optimized static files in the `/dist` directory.

## 📬 Connect

- **LinkedIn:** [https://www.linkedin.com/in/surajsarkar0/](https://www.linkedin.com/in/surajsarkar0/)
- **Medium:** [https://surajsarkar0.medium.com/](https://surajsarkar0.medium.com/)
- **GitHub:** [@surajsarkar](https://github.com/surajsarkar)
