import type { components } from '@/api/generated/schema';

export type Workspace = components['schemas']['WorkspaceResponse'];
export type WorkspaceCreate = components['schemas']['WorkspaceCreate'];
export type WorkspaceUpdate = components['schemas']['WorkspaceUpdate'];
export type WorkspaceListItem = components['schemas']['WorkspaceListItem'];

export type WorkspaceMember = components['schemas']['WorkspaceMemberResponse'];

// export type WorkspaceMemberCreate =
//   components['schemas']['WorkspaceMemberCreate'];

export type WorkspaceJoin = components['schemas']['WorkspaceJoin'];
export type WorkspaceInvitePreview = components['schemas']['WorkspaceInvitePreview'];

export type WorkspaceId = Workspace['id'];
export type WorkspaceMemberId = WorkspaceMember['id'];
