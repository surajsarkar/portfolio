
export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  problem: string;
  solution: string;
  impact: string[];
  expression: 'neutral' | 'irritated' | 'love' | 'excited';
  image: string;
  gif?: string;
  article?: string;
  github?: string;
  tags: string[];
  status?: string;
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
