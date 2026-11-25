import type { components, paths } from '@/api/generated/schema';

export type Settlement = components['schemas']['SettlementResponse'];
export type SettlementCreate = components['schemas']['SettlementCreate'];
export type SettlementStatus = components['schemas']['SettlementStatus'];

export type SuggestedSettlement = components['schemas']['SuggestedSettlementResponse'];

export type SettlementQueryParams = NonNullable<
  paths['/api/v1/workspaces/{workspace_id}/settlements']['get']['parameters']['query']
>;
