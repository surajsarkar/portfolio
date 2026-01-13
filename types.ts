
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  link: string;
  imageUrl?: string;
  caseStudyLink?: string;
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
