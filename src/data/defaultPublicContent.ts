export interface PublicFeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PublicPillarItem {
  id: string;
  num: string;
  title: string;
  description: string;
}

export interface PublicFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PublicDeveloperInfo {
  name: string;
  tagline: string;
  bio: string;
  portfolioUrl: string;
  poweredByText: string;
  email: string;
  instagram: string;
  github: string;
  twitter: string;
}

export interface PublicSiteContent {
  home: {
    heroBadge: string;
    heroTitle: string;
    heroGradientTitle: string;
    heroSubtitle: string;
    heroCtaText: string;
    heroSecondaryCtaText: string;
    featuresTitle: string;
    featuresSubtitle: string;
    features: PublicFeatureItem[];
    bannerTitle: string;
    bannerSubtitle: string;
    bannerCtaText: string;
  };
  about: {
    badge: string;
    title: string;
    gradientTitle: string;
    subtitle: string;
    storyTitle: string;
    storyParagraphs: string[];
    pillarsTitle: string;
    pillarsSubtitle: string;
    pillars: PublicPillarItem[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButtonText: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    supportEmail: string;
    databaseEmail: string;
    faqTitle: string;
    faqSubtitle: string;
    faqList: PublicFaqItem[];
  };
  developer: PublicDeveloperInfo;
}

export const DEFAULT_PUBLIC_CONTENT: PublicSiteContent = {
  home: {
    heroBadge: 'Real-Time Supabase Cloud Sync · Zero Fake Numbers · Role Protected',
    heroTitle: 'Track Your Real Life.',
    heroGradientTitle: 'Build Genuine Progress.',
    heroSubtitle:
      'The high-fidelity productivity, client management, and team workspace. System Administrators allocate projects and approve proposals; Team Members execute with dedicated focus and zero simulated metrics.',
    heroCtaText: 'Member & Admin Sign In',
    heroSecondaryCtaText: 'Read Our Philosophy',
    featuresTitle: 'Engineered For Clarity',
    featuresSubtitle: 'Everything your team needs to plan, build, and verify progress.',
    features: [
      {
        id: 'feat-1',
        title: 'Admin & Member Allocation',
        description:
          'Admins create team members using email and password, allocating specific clients and projects. Members log in to see exclusively what they have permission to access.',
        icon: 'Users',
      },
      {
        id: 'feat-2',
        title: 'Proposal & Approval Workflows',
        description:
          'Members can easily create new clients and connect candidate projects. Admins review pending proposals and approve or reject them with a single click.',
        icon: 'CheckCircle2',
      },
      {
        id: 'feat-3',
        title: 'Supabase Live Database',
        description:
          'Integrated directly with Supabase for persistent, real-time data storage. All activities, tasks, team messages, and clients sync instantaneously across all team devices.',
        icon: 'Cloud',
      },
      {
        id: 'feat-4',
        title: 'Direct Internal Messaging',
        description:
          'Integrated communication hub between Administrators and Team Members. Send announcements, project briefs, and status questions directly within the workspace.',
        icon: 'MessageSquare',
      },
      {
        id: 'feat-5',
        title: 'Daily Journey Fulfillment',
        description:
          'Track daily progress computed dynamically from completed tasks and logged focus time. Mark days complete when milestones are met, or reopen for further updates.',
        icon: 'Flame',
      },
      {
        id: 'feat-6',
        title: 'Truthful Growth & Heatmaps',
        description:
          'Dynamic rolling weekly comparisons and a genuine 16-week GitHub-style heatmap. Every single pixel corresponds to actual time logged in the database.',
        icon: 'BarChart3',
      },
    ],
    bannerTitle: 'Ready to Take Control of Your Real Journey?',
    bannerSubtitle:
      'Sign in as an Administrator or Team Member to access your client projects, daily timeline, and genuine analytics.',
    bannerCtaText: 'Launch Member & Admin Sign In',
  },
  about: {
    badge: 'Our Vision & Philosophy',
    title: 'Built on Truth.',
    gradientTitle: 'Designed for Real Progress.',
    subtitle:
      'Most productivity software pushes artificial streaks, vanity scores, and noisy gamification. We built My Journey on radical honesty: real database synchronicity, verified client milestones, and high-trust collaboration.',
    storyTitle: 'Why We Built My Journey',
    storyParagraphs: [
      'In our experience leading technical projects and consulting for high-growth clients, we noticed a recurring paradox: the tools meant to help us execute often distracted us with simulated metrics, fake completion badges, and arbitrary analytics.',
      'We wanted a workspace that respected the reality of engineering and creative work. A place where an hour worked is recorded as exactly an hour. Where tasks completed mean shipped value. Where client relationships are securely allocated, proposals are transparently reviewed, and every single metric traces back to a live Supabase database record.',
      'That principle became My Journey: a platform that pair-programs with your workflow, honors your focus, and brings Admins and Team Members into complete harmony.',
    ],
    pillarsTitle: 'Foundational Pillars',
    pillarsSubtitle: 'The Principles Behind Every Feature',
    pillars: [
      {
        id: 'pil-1',
        num: '01',
        title: '100% Genuine Metrics',
        description:
          'No fake math, no arbitrary productivity algorithms, and no hardcoded sample numbers. Daily fulfillment and weekly growth rates are calculated purely from your recorded sessions and verified task completions.',
      },
      {
        id: 'pil-2',
        num: '02',
        title: 'High-Trust Role Separation',
        description:
          'Administrators hold sovereign governance: allocating client accounts, reviewing candidate projects, and overseeing finances. Members login with dedicated email credentials, focusing solely on the clients and projects assigned to them.',
      },
      {
        id: 'pil-3',
        num: '03',
        title: 'Live Cloud Sync via Supabase',
        description:
          'Powered by modern PostgreSQL with Supabase Realtime subscriptions. When an Admin approves a project or sends an internal message, team members see it instantly across active sessions.',
      },
      {
        id: 'pil-4',
        num: '04',
        title: 'Data Sovereignty & Privacy',
        description:
          'Your notes, client files, idea vaults, and team messages belong exclusively to your organization. Complete export options (JSON / CSV) ensure you never experience vendor lock-in.',
      },
    ],
    ctaTitle: 'Experience High-Clarity Collaboration',
    ctaSubtitle:
      'Log in with your administrator or team member credentials to see the live workspace in action.',
    ctaButtonText: 'Go to Member & Admin Login',
  },
  contact: {
    badge: 'Direct Contact & Support',
    title: 'Get in Touch',
    subtitle:
      'Have a question about Administrator features, team member provisioning, Supabase database configuration, or client workflows? We are here to assist.',
    supportEmail: 'support@journey.internal',
    databaseEmail: 'database@journey.internal',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Quick Answers',
    faqList: [
      {
        id: 'faq-1',
        question: 'How do Team Members log into the platform?',
        answer:
          'Administrators create member accounts in the "Team Members" modal, specifying their email and initial password. Members navigate to the Login page and sign in using those credentials.',
      },
      {
        id: 'faq-2',
        question: 'Can members see projects belonging to other clients?',
        answer:
          'No. When an Administrator allocates specific clients to a member, that member can only view and manage projects connected to their allocated clients.',
      },
      {
        id: 'faq-3',
        question: 'How does the client and project approval system work?',
        answer:
          'Members can create clients and propose new candidate projects. They are flagged with "Pending Admin Approval" until the Administrator reviews and approves them.',
      },
      {
        id: 'faq-4',
        question: 'Is data synchronized to the Supabase database in real time?',
        answer:
          'Yes. The platform is configured with live Supabase credentials and realtime channel subscriptions, ensuring immediate synchronization across all devices.',
      },
    ],
  },
  developer: {
    name: 'Raghab Barik',
    tagline: 'Lead Architect & Creator',
    bio: 'Software engineer and system architect building high-fidelity client management, personal growth tracking, and cloud-synchronized digital workspaces.',
    portfolioUrl: 'https://www.raghabportfolio.in/',
    poweredByText: 'Powered by https://www.raghabportfolio.in/',
    email: 'rraghabbarik@gmail.com',
    instagram: 'https://instagram.com/raghab_barik',
    github: 'https://github.com/raghabbarik',
    twitter: 'https://x.com/raghabbarik',
  },
};
