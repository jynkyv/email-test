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
  email_send_count?: number;
  email_recipient_count?: number;
  fax_send_count?: number; // 新增：已发送传真数量
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  company_name: string;
  email: string;
  fax?: string;
  address?: string;
  fax_status?: 'active' | 'inactive';
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