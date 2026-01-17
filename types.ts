
export interface Project {
  id: string;
  title: string;
  description: string;
  expression: 'neutral' | 'irritated' | 'love' | 'excited';
  image: string;
  gif?: string;
  article?: string;
  github?: string;
  tags: string[];
}

export interface Technology {
  name: string;
  icon: string;
}

export interface SocialProfile {
  name: string;
  icon: string;
  url: string;
}
