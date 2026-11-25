import type { components } from '@/api/generated/schema';

export type Workspace = components['schemas']['WorkspaceResponse'];
export type WorkspaceCreate = components['schemas']['WorkspaceCreate'];
export type WorkspaceUpdate = components['schemas']['WorkspaceUpdate'];

export type WorkspaceListItem = components['schemas']['WorkspaceListItem'];
export type WorkspaceMember = components['schemas']['WorkspaceMemberResponse'];

export type WorkspaceInvitePreview = components['schemas']['WorkspaceInvitePreview'];
