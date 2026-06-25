import { supabase } from '../lib/supabase';
import type { Workspace } from '../types';

export const fetchWorkspace = async (
  workspaceId: string
): Promise<Workspace | null> => {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
};

export const createWorkspace = async (
  name: string,
  ownerId: string
): Promise<Workspace> => {
  const { data, error } = await supabase
    .from('workspaces')
    .insert([{ name, owner_id: ownerId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWorkspace = async (
  workspaceId: string,
  updates: Partial<Workspace>
): Promise<Workspace> => {
  const { data, error } = await supabase
    .from('workspaces')
    .update(updates as Omit<Partial<Workspace>, 'invite_code'>)
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWorkspace = async (
  workspaceId: string
): Promise<void> => {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (error) throw error;
};
