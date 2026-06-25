import type { Tables } from './database.types';

export type Workspace = Tables<'workspaces'> & { invite_code?: string };
export type Expense = Tables<'expenses'>;
export type UserProfile = Tables<'user_profiles'>;

export interface Member {
  id: UserProfile['id'];
  membership_id?: string;
  workspace_id: Workspace['id'];
  display_name: UserProfile['display_name'];
  avatar_url?: UserProfile['avatar_url'];
  joined_at: Tables<'members'>['joined_at'];
}

export interface Balance {
  member_id: UserProfile['id'];
  member_name: UserProfile['display_name'];
  net_balance: number;
}

export interface Settlement {
  from: UserProfile['display_name'];
  to: UserProfile['display_name'];
  amount: Expense['amount'];
}

export interface WorkspaceItem {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  owner_name: string;
  total_expenses: number;
  member_count: number;
  user_net_balance: number;
  currency: string;
}
