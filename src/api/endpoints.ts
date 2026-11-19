export const API_ENDPOINTS = {
  users: {
    me: '/users/me',
  },

  workspaces: {
    base: '/workspaces',
    detail: (workspaceId: string) => `/workspace/${workspaceId}`,
    join: '/workspaces/join',
    regenerateInviteCode: (workspaceId: string) => `/workspaces/${workspaceId}/invite-code/regenerate`,
    members: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
    removeMember: (workspaceId: string, userId: string) => `/workspaces/${workspaceId}/members/${userId}`,
    expenses: (workspaceId: string) => `/workspaces/${workspaceId}/expenses`,
    balances: (workspaceId: string) => `/workspaces/${workspaceId}/balances`,
    settlements: (workspaceId: string) => `/workspaces/${workspaceId}/settlements`,
    activity: (workspaceId: string) => `/workspaces/${workspaceId}/activity`,
  },

  expenses: {
    base: '/expense',
    detail: (expenseId: number) => `/expenses/${expenseId}`,
  },

  notifications: {
    base: '/notifications',
  },
} as const;
