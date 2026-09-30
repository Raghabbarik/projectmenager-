export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  rollNo?: string;
  department?: string;
  phone?: string;
  course?: string;
  status?: string;
  customFields?: Record<string, string>;
  isValidEmail: boolean;
}

export interface StudentSheet {
  id: string;
  name: string;
  sourceType: 'file' | 'google-sheet' | 'paste' | 'sample';
  uploadedAt: string;
  lastUsedAt?: string;
  students: StudentRecord[];
  columnMappings: {
    name: string;
    email: string;
    rollNo?: string;
    department?: string;
    phone?: string;
  };
  totalCount: number;
  validEmailCount: number;
  googleSheetUrl?: string;
  notes?: string;
}

export interface StudentEmailLog {
  id: string;
  sheetId: string;
  sheetName: string;
  subject: string;
  content: string;
  recipientsCount: number;
  recipientEmails: string[];
  sentAt: string;
  status: 'sent' | 'partial' | 'failed';
  senderEmail: string;
  senderName: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
}
