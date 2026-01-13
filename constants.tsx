
import { Project, Technology, SocialProfile } from './types';

export const TECHNOLOGIES: Technology[] = [
  { name: 'Python', icon: 'terminal' },
  { name: 'Rust', icon: 'settings_system_daydream' },
  { name: 'PyTorch', icon: 'neurology' },
  { name: 'Docker', icon: 'view_in_ar' },
  { name: 'Kubernetes', icon: 'cloud_circle' },
  { name: 'PostgreSQL', icon: 'database' },
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'AI Sentiment Analysis Engine',
    description: 'An optimized NLP model capable of processing 10k+ requests per second for real-time social media sentiment tracking.',
    tags: ['Python', 'BERT', 'FastAPI'],
    icon: 'psychology',
    link: '#',
  },
  {
    id: '2',
    title: 'Fintech Microservices API',
    description: 'Scalable backend architecture for a payment processing gateway, handling secure transactions with 99.99% uptime.',
    tags: ['Go', 'gRPC', 'Redis'],
    icon: 'currency_exchange',
    link: '#',
  },
  {
    id: '3',
    title: 'Autonomous Trading Bot',
    description: 'Real-time data processing system that executes trades based on technical indicators and sentiment scores.',
    tags: ['Rust', 'WebSockets', 'TimescaleDB'],
    icon: 'show_chart',
    link: '#',
  },
  {
    id: '4',
    title: 'Distributed System Monitor',
    description: 'A dashboard for visualizing cluster health and logs across multiple regions.',
    tags: ['TypeScript', 'Kubernetes', 'Prometheus'],
    icon: 'monitoring',
    link: '#',
    imageUrl: 'https://picsum.photos/seed/devio/800/400',
    caseStudyLink: '#',
  },
];

export const SOCIALS: SocialProfile[] = [
  { name: 'GitHub', icon: 'code', url: '#' },
  { name: 'LinkedIn', icon: 'work', url: '#' },
  { name: 'Twitter', icon: 'alternate_email', url: '#' },
];
