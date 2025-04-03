import { User } from '../users/types'; 

export interface Report {
    id: bigint;
    type: 'review' | 'user' | 'business' | 'service' | 'other'; // Enum values from ReportType
    target_id: bigint;
    reason: string;
    description?: string | null;
    submitted_by?: bigint | null;
    resolved_by?: bigint | null;
    resolved_at?: Date | null;
    created_at: Date;
    submitter?: User | null; // Associated user who submitted the report (optional)
    resolver?: User | null;  // Associated user who resolved the report (optional)
  }