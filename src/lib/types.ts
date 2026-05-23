export interface Patient {
  id: string;
  full_name: string;
  birth_date: string;
  dry_weight: number;
  schedule: string[];
  created_at: string;
}

export interface DialysisRecord {
  id: string;
  patient_id: string;
  date: string;
  pre_weight: number;
  pre_bp: string;
  uv: number;
  post_bp: string;
  post_weight: number;
  notes?: string;
  created_at: string;
}
