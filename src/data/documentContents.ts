export interface DocumentSection {
  heading: string;
  badge?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  codeBlock?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface DocumentDetail {
  title: string;
  subtitle: string;
  category: string;
  author: string;
  date: string;
  status: string;
  version: string;
  sections: DocumentSection[];
  isWireframe?: boolean;
  isArchitecture?: boolean;
}

export const SAMPLE_DOCUMENTS: Record<string, DocumentDetail> = {
  'requirements.pdf': {
    title: 'Software Requirements Specification (SRS)',
    subtitle: 'My Journey Enterprise Platform — Architecture & Functional Scope',
    category: 'Engineering / Architecture',
    author: 'Raghab Barik (Principal Lead Architect)',
    date: 'September 12, 2026',
    status: 'Approved & Active',
    version: 'v2.4.0',
    sections: [
      {
        heading: '1. Executive Summary & Core Objective',
        badge: 'Strategic Vision',
        paragraphs: [
          'The Journey Platform is a unified operational hub designed to empower technical leads, freelancers, and educators to orchestrate strategic client projects, developer milestones, and student roster communications from a single interface.',
          'The platform prioritizes local-first performance and uninterrupted data sovereignty: user files, drafts, and active projects are mirrored locally via browser IndexedDB while maintaining cloud synchronization with Supabase and Redis.',
        ],
      },
      {
        heading: '2. System Architecture & Tech Stack',
        badge: 'Infrastructure',
        paragraphs: [
          'The system adheres to modern reactive front-end principles with decoupled persistence layers to ensure high responsiveness across varying network conditions.',
        ],
        table: {
          headers: ['Tier / Layer', 'Technology', 'Purpose / Responsibility'],
          rows: [
            ['Frontend Core', 'React 19, TypeScript, Vite', 'Single-page reactive application with micro-interactions'],
            ['Styling System', 'Tailwind CSS, Dark/Light Themes', 'High-contrast design system following ColorHunt dark palette'],
            ['Client Persistence', 'IndexedDB (my_journey_files_db)', 'Resilient binary file storage for PDFs, images, and attachments'],
            ['Database & Auth', 'Supabase (PostgreSQL 15)', 'Multi-tenant cloud data storage with Row Level Security'],
            ['Cache Tier', 'Upstash Redis', 'Shared memory cache for live heartbeats, milestones & public CMS'],
            ['Communication', 'Resend REST API & Gmail Web', 'Automated student roster dispatch and 1-click mail composer'],
          ],
        },
      },
      {
        heading: '3. Key Functional Modules',
        badge: 'Feature Scope',
        paragraphs: [
          'The platform is structured into modular domains operating under unified global state management:',
        ],
        bulletPoints: [
          'Project & Milestone Tracker: Manage client deliverables, timeline progress bars, and linked plan files.',
          'Student Sheet Mailer: Import Google Sheets or Excel rosters, validate student emails, and broadcast personalized updates with template tags ({{name}}, {{rollNo}}, {{department}}).',
          'Resilient File Vault: Permanent storage for project blueprints, wireframes, PDFs, and attachments that survive page reloads and cache wipes.',
          'Daily Particular Tasks: Track personal habits, water intake, exercises, and work items with day completion streaks.',
          'Client Accounts & Billing: Financial tracking of billable amounts, hourly rates, and payment settlements.',
        ],
      },
      {
        heading: '4. Non-Functional Requirements & Compliance',
        badge: 'Reliability',
        paragraphs: [
          'Strict adherence to zero data loss principles. Client file attachments are saved synchronously to IndexedDB before updating application state.',
          'All email broadcasts to student rosters automatically employ BCC batching or direct 1-to-1 mail clients to prevent recipient email address leakage.',
        ],
      },
    ],
  },

  'meeting-notes-abc.pdf': {
    title: 'Strategic Alignment & Quarterly Review',
    subtitle: 'Client ABC Stakeholder Meeting — Q3 Deliverables & Q4 Roadmap',
    category: 'Client Relations / Minutes',
    author: 'Raghab Barik (Lead Facilitator)',
    date: 'September 27, 2026',
    status: 'Finalized & Distributed',
    version: 'v1.0',
    sections: [
      {
        heading: '1. Meeting Overview & Attendees',
        paragraphs: [
          'A formal review session was held on September 27, 2026, with Client ABC executive stakeholders to evaluate Q3 deliverables and approve the functional specification for the new Student Sheet Mailer module.',
        ],
        bulletPoints: [
          'Raghab Barik — System Administrator & Lead Architect',
          'David Miller — VP of Operations, Client ABC',
          'Dr. Priya Sharma — Academic Roster Coordinator',
        ],
      },
      {
        heading: '2. Agenda & Discussion Points',
        badge: 'Discussion',
        paragraphs: [
          'The committee reviewed the operational bottlenecks faced during end-of-semester student communications and verified the requirements for direct Google Sheet synchronization.',
        ],
        bulletPoints: [
          'Roster Import Flexibility: Approved support for both public Google Sheets URLs and local Excel (.xlsx/.xls) / CSV uploads.',
          'Communication Security: Agreed that BCC batching or individual Gmail Web launches must be default to guarantee privacy compliance.',
          'Attachment Reliability: Validated that uploaded exam notices and project plan documents must remain permanently cached in local browser storage.',
        ],
      },
      {
        heading: '3. Approved Action Items & Next Steps',
        badge: 'Action Items',
        paragraphs: [
          'All participants signed off on the development timeline with the following commitments:',
        ],
        table: {
          headers: ['Action Item', 'Assigned To', 'Target Date', 'Status'],
          rows: [
            ['Integrate Resend API & Gmail Web BCC composer', 'Raghab Barik', 'Oct 02, 2026', 'Completed'],
            ['IndexedDB permanent file caching for PDFs', 'Raghab Barik', 'Oct 04, 2026', 'Completed'],
            ['User acceptance testing with 200 student roster', 'Dr. Priya Sharma', 'Oct 10, 2026', 'Scheduled'],
            ['Production release deployment to Vercel edge', 'Raghab Barik', 'Oct 15, 2026', 'Pending'],
          ],
        },
      },
    ],
  },

  'raft-consensus-paper.pdf': {
    title: 'In Search of an Understandable Consensus Algorithm',
    subtitle: 'Technical Digest of the Raft Distributed Consensus Protocol',
    category: 'Distributed Systems / Research',
    author: 'Diego Ongaro & John Ousterhout (Stanford University)',
    date: 'September 26, 2026',
    status: 'Archived Reference',
    version: 'Extended Edition',
    sections: [
      {
        heading: '1. Abstract & Motivation',
        badge: 'Overview',
        paragraphs: [
          'Raft is a consensus algorithm designed as an alternative to Paxos. It was developed to overcome the significant difficulty of understanding and implementing Paxos in real-world distributed architectures.',
          'Raft separates the key elements of consensus — such as leader election, log replication, and safety — into discrete subproblems, reducing the state space that system designers must reason about.',
        ],
      },
      {
        heading: '2. Core Protocol Mechanics',
        badge: 'State Machine',
        paragraphs: [
          'A Raft cluster typically consists of five servers, allowing the system to tolerate two failures while preserving consistency.',
        ],
        bulletPoints: [
          'Server States: At any given moment, each server is in one of three states: Leader, Follower, or Candidate.',
          'Terms: Time is divided into arbitrary terms identified by monotonically increasing integers. Each term begins with an election.',
          'Leader Election: Triggered when a follower times out waiting for a heartbeat. Randomized election timeouts (150ms - 300ms) prevent split votes.',
          'Log Replication: The leader accepts log commands from clients, appends them to its log, and issues AppendEntries RPCs to replicate them across followers.',
          'Commitment Invariant: An entry is committed once replicated on a majority of nodes; committed entries are guaranteed to be durable and executed in state machine order.',
        ],
      },
      {
        heading: '3. Comparison with Alternative Consensus Protocols',
        table: {
          headers: ['Criterion', 'Raft Algorithm', 'Multi-Paxos', 'Zab (ZooKeeper)'],
          rows: [
            ['Understandability', 'High (Decomposed subproblems)', 'Low (Subtle edge cases)', 'Medium (Primary-backup based)'],
            ['Leader Model', 'Strong leader (Append-only)', 'Weak leader (Multiple proposers)', 'Primary order dependent'],
            ['Membership Changes', 'Joint consensus / Single-server', 'Complex reconfigurations', 'Epoch-based reconfiguration'],
            ['Production Adoptions', 'etcd, CockroachDB, TiKV', 'Chubby, Spanner', 'Apache ZooKeeper'],
          ],
        },
      },
    ],
  },

  'api-specification-v1.pdf': {
    title: 'My Journey Platform REST API Specification',
    subtitle: 'Official API v1 Reference for Clients, Projects & Broadcasts',
    category: 'API Documentation',
    author: 'Journey Engineering Team',
    date: 'September 10, 2026',
    status: 'Active Spec',
    version: 'v1.0.0',
    sections: [
      {
        heading: '1. Base URL & Authentication',
        badge: 'Security',
        paragraphs: [
          'All API requests must be issued over HTTPS. Authenticate using Bearer tokens issued by Supabase Auth.',
        ],
        codeBlock: `Base URL: https://api.myjourney.app/v1
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json`,
      },
      {
        heading: '2. Key Endpoints Reference',
        badge: 'REST Endpoints',
        paragraphs: [
          'The primary operational routes supported by the Journey Platform gateway:',
        ],
        table: {
          headers: ['Method', 'Endpoint', 'Description', 'Auth Required'],
          rows: [
            ['GET', '/projects', 'Fetch all projects and linked plan files', 'Yes (Admin/Member)'],
            ['POST', '/projects', 'Create a new client project', 'Yes (Admin)'],
            ['GET', '/mailer/sheets', 'List saved student rosters & metadata', 'Yes (Admin)'],
            ['POST', '/mailer/send', 'Dispatch batch email via Resend API', 'Yes (Admin)'],
            ['GET', '/files/:id', 'Download or stream attachment blob', 'Yes (All Roles)'],
            ['DELETE', '/files/:id', 'Permanently purge file from storage', 'Yes (Admin)'],
          ],
        },
      },
      {
        heading: '3. Sample Request Payload: Student Broadcast',
        codeBlock: `{
  "sheetId": "sheet-2026-q3",
  "recipients": [
    { "name": "Aditya Verma", "email": "aditya.verma@example.edu", "rollNo": "CS2026-001" },
    { "name": "Sneha Roy", "email": "sneha.roy@example.edu", "rollNo": "CS2026-002" }
  ],
  "subject": "Important Academic Notice: {{sheetName}}",
  "body": "Dear {{name}}, please find your updated schedule attached."
}`,
      },
    ],
  },

  'market-analysis-2026.pdf': {
    title: 'Developer Productivity & Management Tools Market Study',
    subtitle: 'Industry Landscape, Offline-First Architecture & Educational Tech',
    category: 'Market Research',
    author: 'Product Strategy Group',
    date: 'September 15, 2026',
    status: 'Published',
    version: 'v1.2',
    sections: [
      {
        heading: '1. Market Trends & Competitive Landscape',
        paragraphs: [
          'The modern developer workspace requires tight integration between project milestones, personal accountability tracking, and stakeholder communication channels.',
          'Platforms that offer offline-first resilience with seamless cloud backups demonstrate 40% higher retention among engineering teams and educational instructors.',
        ],
        bulletPoints: [
          'Offline-First Data Sovereignty: Users demand that their project drafts and attachments remain accessible even in disconnected environments.',
          'Lightweight Student Communication: Teachers and admins increasingly rely on spreadsheet imports rather than clunky legacy LMS portals.',
        ],
      },
    ],
  },

  'cloud-infrastructure-spec.pdf': {
    title: 'Cloud Infrastructure & Edge Deployment Specification',
    subtitle: 'High Availability Multi-Region Topology & Caching Architecture',
    category: 'DevOps / Cloud Architecture',
    author: 'Cloud Infrastructure Team',
    date: 'September 20, 2026',
    status: 'Approved',
    version: 'v2.1',
    sections: [
      {
        heading: '1. Multi-Tier Deployment Topology',
        paragraphs: [
          'The platform leverages globally distributed edge nodes for instant static asset delivery, paired with low-latency regional database clusters.',
        ],
        bulletPoints: [
          'Edge Hosting: Vercel Edge Network with HTTP/3 and automated Brotli compression.',
          'Database Tier: Supabase Managed PostgreSQL with automatic daily snapshots and connection pooling.',
          'Shared Cache: Upstash Redis multi-region active replication for sub-10ms heartbeat latency.',
        ],
      },
    ],
  },

  'brand-guidelines.pdf': {
    title: 'Brand Identity & Visual Design System',
    subtitle: 'Color Tokens, Typography Hierarchy & Dark Mode Specifications',
    category: 'Design System',
    author: 'Design & UI/UX Guild',
    date: 'September 08, 2026',
    status: 'Active Guidelines',
    version: 'v3.0',
    sections: [
      {
        heading: '1. Color Palette Philosophy',
        paragraphs: [
          'The platform implements a curated high-contrast ColorHunt dark palette tailored for long development sessions with minimal eye fatigue.',
        ],
        bulletPoints: [
          'Primary Brand: Indigo #4F46E5 (Accent and interactive focal points)',
          'Dark Canvas: Neutral #0A0A0A to #171717 (Deep, glare-free dark backgrounds)',
          'Light Canvas: Slate #F8FAFC with crisp subtle borders #E2E8F0',
          'Status Accents: Emerald #10B981 for completed items, Rose #F43F5E for critical deadlines.',
        ],
      },
    ],
  },

  'user-research-report.pdf': {
    title: 'User Experience Research & Usability Study',
    subtitle: 'Feedback Analysis from 45 Engineering Leads & Academic Instructors',
    category: 'UX Research',
    author: 'UX Research Lead',
    date: 'September 18, 2026',
    status: 'Completed',
    version: 'v1.0',
    sections: [
      {
        heading: '1. Key Usability Findings',
        paragraphs: [
          'Participants praised the unified view combining Daily Habits with Client Projects, specifically citing the quick add modal and instant PDF preview as high-value time savers.',
        ],
        bulletPoints: [
          '92% of respondents rated the Student Sheet Mailer as significantly easier to use than traditional bulk email systems.',
          '100% of participants confirmed that files uploaded to the file vault must stay permanently available without disappearing on refresh.',
        ],
      },
    ],
  },

  'ux-wireframes-v3.pdf': {
    title: 'User Experience Flow & Wireframe Blueprint',
    subtitle: 'Interaction Specifications for Roster Sync & File Management',
    category: 'UI/UX Architecture',
    author: 'Product Design Lead',
    date: 'September 22, 2026',
    status: 'Approved',
    version: 'v3.0',
    sections: [
      {
        heading: '1. Core Navigation & Workspace Hierarchy',
        paragraphs: [
          'The layout follows a responsive two-column dashboard structure with collapsible sidebar navigation and floating command palette (Ctrl+K).',
        ],
        bulletPoints: [
          'Sidebar: Quick access to Dashboard, Projects, Daily Tasks, Student Sheet Mailer, Files, and Settings.',
          'Files Section: Drag-and-drop dropzone, live search, project filtering, and instant in-browser preview modal.',
        ],
      },
    ],
  },
};

/**
 * Returns structured document details for any file name, or creates a standard fallback.
 */
export function getDocumentContent(file: { name: string; size?: string; uploadedAt?: string; type?: string }): DocumentDetail {
  const normalizedName = file.name.toLowerCase().trim();

  // 1. Direct match in dictionary
  if (SAMPLE_DOCUMENTS[normalizedName]) {
    return SAMPLE_DOCUMENTS[normalizedName];
  }

  // 2. Partial matches
  for (const [key, val] of Object.entries(SAMPLE_DOCUMENTS)) {
    if (normalizedName.includes(key.replace('.pdf', '').replace('.png', ''))) {
      return val;
    }
  }

  // 3. Fallback for custom uploaded files
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  return {
    title: formattedTitle,
    subtitle: `File Attachment: ${file.name}`,
    category: file.type || 'Document Attachment',
    author: 'Uploaded Document',
    date: file.uploadedAt ? file.uploadedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: 'Verified Stored Asset',
    version: '1.0',
    sections: [
      {
        heading: 'Document Overview & File Information',
        paragraphs: [
          `This document ("${file.name}") is securely stored in your local application vault.`,
          `File size: ${file.size || 'Standard Size'}. Registered type: ${file.type || 'Binary / Document'}.`,
          'You can read the structured details below, preview binary assets, or download the original file to your device at any time.',
        ],
      },
      {
        heading: 'Storage & Data Resilience',
        paragraphs: [
          'This file is permanently indexed in the browser\'s IndexedDB client storage vault (my_journey_files_db) and synchronized across application sessions.',
        ],
      },
    ],
  };
}
