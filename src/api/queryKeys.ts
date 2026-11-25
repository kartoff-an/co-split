import type { ExpenseFilters, SettlementQueryParams } from './types';

export const queryKeys = {
  workspaces: {
    all: ['workspaces'] as const,
    list: (userId?: string) => ['workspaces', userId] as const,
  },

  workspace: {
    all: ['workspace'] as const,
    detail: (workspaceId: string) => ['workspace', workspaceId] as const,
  },

  expenses: {
    all: ['workspace-expenses'] as const,
    workspace: (workspaceId: string) => ['workspace-expenses', workspaceId] as const,
    list: (workspaceId: string, filters: ExpenseFilters, pageSize: number) =>
      ['workspace-expenses', workspaceId, { filters, pageSize }] as const,
  },

  balances: {
    all: ['workspace-balance'] as const,
    detail: (workspaceId: string) => ['workspace-balance', workspaceId] as const,
    overview: (workspaceId: string) => ['workspace-balance-overview', workspaceId] as const,
  },

  settlements: {
    all: ['workspace-settlements'] as const,
    workspace: (workspaceId: string) => ['workspace-settlements', workspaceId] as const,
    list: (workspaceId: string, filters: SettlementQueryParams) =>
    ['workspace-settlements', workspaceId, filters] as const
  },

  activity: {
    all: ['workspace-activity'] as const,
    workspace: (workspaceId: string) => ['workspace-activity', workspaceId] as const,
  },

  notifications: {
    all: ['notifications'] as const,
  },
} as const;
