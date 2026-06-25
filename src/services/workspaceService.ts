import { supabase } from '../lib/supabase';
import {
  fetchWorkspaceMembers,
  addMemberToWorkspace,
  removeMemberFromWorkspace,
  fetchMemberCount,
} from '../db/members';
import {
  fetchWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace as dbDeleteWorkspace,
} from '../db/workspaces';
import { fetchUserProfile } from '../db/profiles';
import type { Workspace, Member, WorkspaceItem } from '../types';

interface SupabaseRpc {
  rpc(
    fn: string,
    args: Record<string, unknown>
  ): Promise<{ data: unknown; error: unknown }>;
}

interface DBWorkspaceItem {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  owner_name: string;
  currency: string;
  total_expenses: number;
  member_count: number;
  user_net_balance: number;
}

interface DBMemberResult {
  id: string;
  workspace_id: string;
  user_id: string;
  joined_at: string;
  user_profiles: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export const getUserWorkspaces = async (
  userId: string
): Promise<WorkspaceItem[]> => {
  const client = supabase as unknown as SupabaseRpc;
  const { data, error } = await client.rpc('get_user_workspaces', {
    u_id: userId,
  });

  if (error) throw error;

  const list = data as DBWorkspaceItem[] | null;

  return (list || []).map((w) => ({
    id: w.id,
    name: w.name,
    created_at: w.created_at,
    owner_id: w.owner_id,
    owner_name: w.owner_name,
    currency: w.currency,
    total_expenses: Number(w.total_expenses),
    member_count: Number(w.member_count),
    user_net_balance: Number(w.user_net_balance),
  }));
};

export const createWorkspaceWithMember = async (
  name: string,
  ownerId: string
): Promise<string> => {
  const workspace = await createWorkspace(name, ownerId);
  await addMemberToWorkspace(workspace.id, ownerId);
  return workspace.id;
};

export const joinWorkspaceWithCode = async (
  inviteCode: string
): Promise<string> => {
  const client = supabase as unknown as SupabaseRpc;
  const { data, error } = await client.rpc('join_workspace_with_code', {
    invite_uuid: inviteCode,
  });

  if (error) throw error;
  return data as string;
};

export const regenerateInviteCode = async (
  workspaceId: string
): Promise<string> => {
  const client = supabase as unknown as SupabaseRpc;
  const { data, error } = await client.rpc('regenerate_workspace_invite_code', {
    w_id: workspaceId,
  });

  if (error) throw error;
  return data as string;
};

export const joinWorkspace = async (
  pastedLinkOrId: string,
  _userId: string
): Promise<string> => {
  const input = pastedLinkOrId.trim();
  let inviteCode: string | null = null;

  if (input.includes('/join/')) {
    try {
      const url = new URL(input);
      const pathParts = url.pathname.split('/');
      const joinIndex = pathParts.indexOf('join') + 1;
      if (joinIndex > 0 && joinIndex < pathParts.length) {
        inviteCode = pathParts[joinIndex];
      }
    } catch (e) {
      console.error('Failed to parse pasted join URL:', e);
    }
  } else if (input.includes('/workspace/')) {
    try {
      const url = new URL(input);
      inviteCode = url.searchParams.get('code');
    } catch (e) {
      console.error('Failed to parse pasted legacy URL:', e);
    }
  } else if (input.includes(':')) {
    const parts = input.split(':');
    inviteCode = parts[1] || parts[0];
  } else {
    inviteCode = input;
  }

  if (!inviteCode) {
    throw new Error(
      'An invite code or full invite link is required to join this ledger.'
    );
  }

  return joinWorkspaceWithCode(inviteCode);
};

export const getWorkspaceDetails = async (
  workspaceId: string
): Promise<{
  workspace: Workspace | null;
  members: Member[];
}> => {
  const workspace = await fetchWorkspace(workspaceId);
  if (!workspace) return { workspace: null, members: [] };

  const rawMembers = await fetchWorkspaceMembers(workspaceId);

  const mappedMembers: Member[] = (
    rawMembers as unknown as DBMemberResult[]
  ).map((member) => ({
    id: member.user_id,
    membership_id: String(member.id),
    workspace_id: member.workspace_id,
    display_name: member.user_profiles?.display_name || 'Unknown',
    avatar_url: member.user_profiles?.avatar_url || null,
    joined_at: member.joined_at,
  }));

  return { workspace, members: mappedMembers };
};

export const addMemberToWorkspaceWithCheck = async (
  workspaceId: string,
  userId: string
): Promise<Member | null> => {
  const workspace = await fetchWorkspace(workspaceId);
  if (!workspace) throw new Error('Workspace not found.');

  const count = await fetchMemberCount(workspaceId);
  const limit = workspace.allowed_members ?? 10;
  if (count >= limit) {
    throw new Error(`This workspace has reached its member limit of ${limit}.`);
  }

  const data = await addMemberToWorkspace(workspaceId, userId);
  const profile = await fetchUserProfile(userId);

  if (profile) {
    return {
      id: userId,
      membership_id: String(data.id),
      workspace_id: workspaceId,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      joined_at: data.joined_at,
    };
  }

  return null;
};

export const removeMember = async (
  workspaceId: string,
  userId: string
): Promise<boolean> => {
  await removeMemberFromWorkspace(workspaceId, userId);
  return true;
};

export const updateWorkspaceDetails = async (
  workspaceId: string,
  updates: Partial<Workspace>
): Promise<Workspace | null> => {
  return updateWorkspace(workspaceId, updates);
};

export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  await dbDeleteWorkspace(workspaceId);
};

export const subscribeToWorkspaceExpenses = (
  workspaceId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEvent: (payload: any) => void
) => {
  return supabase
    .channel(`expenses:${workspaceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `workspace_id=eq.${workspaceId}`,
      },
      onEvent
    )
    .subscribe();
};

export const subscribeToWorkspaceMembers = (
  workspaceId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEvent: (payload: any) => void
) => {
  return supabase
    .channel(`members:${workspaceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'members',
        filter: `workspace_id=eq.${workspaceId}`,
      },
      onEvent
    )
    .subscribe();
};

export const subscribeToUserMemberships = (
  userId: string,
  onEvent: () => void
) => {
  return supabase
    .channel(`dashboard_members:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'members',
        filter: `user_id=eq.${userId}`,
      },
      onEvent
    )
    .subscribe();
};
