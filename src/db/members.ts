/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export const fetchUserMemberships = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('members')
    .select(
      `
      workspace_id,
      workspaces (
        id,
        name,
        created_at,
        owner_id,
        currency,
        user_profiles:owner_id (display_name)
      )
    `
    )
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

export const fetchWorkspaceMembers = async (
  workspaceId: string
): Promise<any[]> => {
  const { data, error } = await supabase
    .from('members')
    .select('*, user_profiles(*)')
    .eq('workspace_id', workspaceId);

  if (error) throw error;
  return data || [];
};

export const fetchMembersForWorkspaces = async (
  workspaceIds: string[]
): Promise<any[]> => {
  const { data, error } = await supabase
    .from('members')
    .select('workspace_id, user_id')
    .in('workspace_id', workspaceIds);

  if (error) throw error;
  return data || [];
};

export const checkMembershipExists = async (
  workspaceId: string,
  userId: string
): Promise<any | null> => {
  const { data, error } = await supabase
    .from('members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const addMemberToWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<any> => {
  const { data, error } = await supabase
    .from('members')
    .insert([{ workspace_id: workspaceId, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeMemberFromWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const fetchMemberCount = async (
  workspaceId: string
): Promise<number> => {
  const { count, error } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  if (error) throw error;
  return count || 0;
};
