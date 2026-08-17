import { describe, it, expect } from 'vitest';

interface MockMember {
  id: string;
  name: string;
}

interface MockExpense {
  id: number;
  amount: number;
  paid_by: string;
  category: string;
  split_members: string[] | null;
}

// Simulates PostgreSQL calculate_workspace_balances
function calculateLedgerBalances(
  members: MockMember[],
  expenses: MockExpense[]
) {
  const memberCount = members.length;
  let totalCost = 0;
  const balancesMap: Record<string, number> = {};

  for (const m of members) {
    balancesMap[m.id] = 0;
  }

  for (const e of expenses) {
    // Exclude payments/settlements from total cost
    if (e.category !== 'Payment' && e.category !== 'Settlement') {
      totalCost += e.amount;
    }

    const splitCount =
      e.split_members && e.split_members.length > 0
        ? e.split_members.length
        : memberCount;

    const amountPerPerson = e.amount / splitCount;

    // Credit payer
    if (balancesMap[e.paid_by] !== undefined) {
      balancesMap[e.paid_by] += e.amount;
    }

    // Debit split members
    if (e.split_members && e.split_members.length > 0) {
      for (const splitMemberId of e.split_members) {
        if (balancesMap[splitMemberId] !== undefined) {
          balancesMap[splitMemberId] -= amountPerPerson;
        }
      }
    } else {
      for (const m of members) {
        balancesMap[m.id] -= amountPerPerson;
      }
    }
  }

  const balances = members.map((m) => ({
    member_id: m.id,
    member_name: m.name,
    net_balance: Number(balancesMap[m.id].toFixed(2)),
  }));

  return {
    balances,
    total_workspace_cost: Number(totalCost.toFixed(2)),
    average_cost_per_person:
      memberCount > 0 ? Number((totalCost / memberCount).toFixed(2)) : 0,
  };
}

// Simulates PostgreSQL get_user_workspaces for a single user
function calculateDashboardWorkspaceSummary(
  userId: string,
  members: MockMember[],
  expenses: MockExpense[]
) {
  const memberCount = members.length;

  const totalCost = expenses
    .filter((e) => e.category !== 'Payment' && e.category !== 'Settlement')
    .reduce((sum, e) => sum + e.amount, 0);

  let userNetBal = 0;
  for (const e of expenses) {
    const splitCount =
      e.split_members && e.split_members.length > 0
        ? e.split_members.length
        : memberCount;

    const credit = e.paid_by === userId ? e.amount : 0;
    let debit = 0;

    if (e.split_members && e.split_members.length > 0) {
      if (e.split_members.includes(userId)) {
        debit = e.amount / splitCount;
      }
    } else {
      debit = e.amount / splitCount;
    }

    userNetBal += credit - debit;
  }

  return {
    total_expenses: Number(totalCost.toFixed(2)),
    member_count: memberCount,
    user_net_balance: Number(userNetBal.toFixed(2)),
  };
}

describe('Balance calculation parity between Ledger and Dashboard', () => {
  const alice: MockMember = { id: 'user-alice', name: 'Alice' };
  const bob: MockMember = { id: 'user-bob', name: 'Bob' };
  const charlie: MockMember = { id: 'user-charlie', name: 'Charlie' };
  const members = [alice, bob, charlie];

  it('should accurately calculate standard evenly-split expenses', () => {
    // Alice pays $90 for groceries split among all 3 members (Alice, Bob, Charlie)
    const expenses: MockExpense[] = [
      {
        id: 1,
        amount: 90,
        paid_by: alice.id,
        category: 'Groceries',
        split_members: null,
      },
    ];

    const ledger = calculateLedgerBalances(members, expenses);
    const aliceLedger = ledger.balances.find((b) => b.member_id === alice.id)!;
    const bobLedger = ledger.balances.find((b) => b.member_id === bob.id)!;
    const charlieLedger = ledger.balances.find(
      (b) => b.member_id === charlie.id
    )!;

    expect(aliceLedger.net_balance).toBe(60); // Paid 90 - Share 30 = +60
    expect(bobLedger.net_balance).toBe(-30);
    expect(charlieLedger.net_balance).toBe(-30);
    expect(ledger.total_workspace_cost).toBe(90);

    const aliceDash = calculateDashboardWorkspaceSummary(
      alice.id,
      members,
      expenses
    );
    const bobDash = calculateDashboardWorkspaceSummary(
      bob.id,
      members,
      expenses
    );
    const charlieDash = calculateDashboardWorkspaceSummary(
      charlie.id,
      members,
      expenses
    );

    expect(aliceDash.user_net_balance).toBe(aliceLedger.net_balance);
    expect(bobDash.user_net_balance).toBe(bobLedger.net_balance);
    expect(charlieDash.user_net_balance).toBe(charlieLedger.net_balance);
    expect(aliceDash.total_expenses).toBe(ledger.total_workspace_cost);
  });

  it('should correctly update balances when a settlement payment is recorded', () => {
    // 1. Alice pays $90 for all 3 (Alice +60, Bob -30, Charlie -30)
    // 2. Bob pays Alice $30 via Settle Up
    const expenses: MockExpense[] = [
      {
        id: 1,
        amount: 90,
        paid_by: alice.id,
        category: 'Groceries',
        split_members: null,
      },
      {
        id: 2,
        amount: 30,
        paid_by: bob.id,
        category: 'Payment',
        split_members: [alice.id],
      },
    ];

    const ledger = calculateLedgerBalances(members, expenses);
    const aliceLedger = ledger.balances.find((b) => b.member_id === alice.id)!;
    const bobLedger = ledger.balances.find((b) => b.member_id === bob.id)!;
    const charlieLedger = ledger.balances.find(
      (b) => b.member_id === charlie.id
    )!;

    // Alice: was +60, received 30 -> now +30 (Charlie still owes 30)
    expect(aliceLedger.net_balance).toBe(30);
    // Bob: was -30, paid 30 -> now 0 (Settled)
    expect(bobLedger.net_balance).toBe(0);
    // Charlie: still owes 30
    expect(charlieLedger.net_balance).toBe(-30);
    // Total expense should remain 90, excluding the 30 payment
    expect(ledger.total_workspace_cost).toBe(90);

    const aliceDash = calculateDashboardWorkspaceSummary(
      alice.id,
      members,
      expenses
    );
    const bobDash = calculateDashboardWorkspaceSummary(
      bob.id,
      members,
      expenses
    );
    const charlieDash = calculateDashboardWorkspaceSummary(
      charlie.id,
      members,
      expenses
    );

    expect(aliceDash.user_net_balance).toBe(30);
    expect(aliceDash.user_net_balance).toBe(aliceLedger.net_balance);

    expect(bobDash.user_net_balance).toBe(0);
    expect(bobDash.user_net_balance).toBe(bobLedger.net_balance);

    expect(charlieDash.user_net_balance).toBe(-30);
    expect(charlieDash.user_net_balance).toBe(charlieLedger.net_balance);

    expect(aliceDash.total_expenses).toBe(90);
  });

  it('should handle custom split where payer is not in split_members', () => {
    // Alice buys concert tickets for Bob and Charlie ($100 total, $50 each)
    // Alice is not in split_members
    const expenses: MockExpense[] = [
      {
        id: 1,
        amount: 100,
        paid_by: alice.id,
        category: 'Entertainment',
        split_members: [bob.id, charlie.id],
      },
    ];

    const ledger = calculateLedgerBalances(members, expenses);
    const aliceLedger = ledger.balances.find((b) => b.member_id === alice.id)!;
    const bobLedger = ledger.balances.find((b) => b.member_id === bob.id)!;
    const charlieLedger = ledger.balances.find(
      (b) => b.member_id === charlie.id
    )!;

    expect(aliceLedger.net_balance).toBe(100);
    expect(bobLedger.net_balance).toBe(-50);
    expect(charlieLedger.net_balance).toBe(-50);

    const aliceDash = calculateDashboardWorkspaceSummary(
      alice.id,
      members,
      expenses
    );
    const bobDash = calculateDashboardWorkspaceSummary(
      bob.id,
      members,
      expenses
    );
    const charlieDash = calculateDashboardWorkspaceSummary(
      charlie.id,
      members,
      expenses
    );

    expect(aliceDash.user_net_balance).toBe(100);
    expect(aliceDash.user_net_balance).toBe(aliceLedger.net_balance);
    expect(bobDash.user_net_balance).toBe(-50);
    expect(bobDash.user_net_balance).toBe(bobLedger.net_balance);
    expect(charlieDash.user_net_balance).toBe(-50);
    expect(charlieDash.user_net_balance).toBe(charlieLedger.net_balance);
  });

  it('should completely settle all balances when all debts are repaid', () => {
    const expenses: MockExpense[] = [
      {
        id: 1,
        amount: 60,
        paid_by: alice.id,
        category: 'Dinner',
        split_members: [bob.id], // Alice paid $60 exclusively for Bob
      },
      {
        id: 2,
        amount: 60,
        paid_by: bob.id,
        category: 'Payment',
        split_members: [alice.id], // Bob pays back Alice $60
      },
    ];

    const ledger = calculateLedgerBalances([alice, bob], expenses);
    const aliceLedger = ledger.balances.find((b) => b.member_id === alice.id)!;
    const bobLedger = ledger.balances.find((b) => b.member_id === bob.id)!;

    expect(aliceLedger.net_balance).toBe(0);
    expect(bobLedger.net_balance).toBe(0);
    expect(ledger.total_workspace_cost).toBe(60);

    const aliceDash = calculateDashboardWorkspaceSummary(
      alice.id,
      [alice, bob],
      expenses
    );
    const bobDash = calculateDashboardWorkspaceSummary(
      bob.id,
      [alice, bob],
      expenses
    );

    expect(aliceDash.user_net_balance).toBe(0);
    expect(bobDash.user_net_balance).toBe(0);
    expect(aliceDash.total_expenses).toBe(60);
  });
});
