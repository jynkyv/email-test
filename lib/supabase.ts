import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义
export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'employee';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  company_name: string;
  email: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  content: string;
  sent_by: string;
  customer_ids: string[];
  created_at: string;
}