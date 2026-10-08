import { describe, expect, it } from 'vitest';
import {
  buildExpenseEmail,
  escapeHtml,
  getRetryDelayMs,
} from './dispatch-expense-emails.js';

describe('expense email helpers', () => {
  it('escapes dynamic HTML content', () => {
    expect(escapeHtml(`<Room & "Board">'`)).toBe(
      '&lt;Room &amp; &quot;Board&quot;&gt;&#39;'
    );
  });

  it('formats an expense email and escapes its workspace link', () => {
    const email = buildExpenseEmail({
      workspaceName: '<Flatmates>',
      description: 'Dinner & groceries',
      amount: 25.5,
      currency: 'USD',
      workspaceUrl: 'https://cosplit.site/workspace/abc?x=1&y=2',
      logoUrl: 'https://cosplit.site/icons/co-split-icon.png',
    });

    expect(email.subject).toContain('<Flatmates>');
    expect(email.text).toContain('$25.50');
    expect(email.html).toContain('&lt;Flatmates&gt;');
    expect(email.html).toContain('x=1&amp;y=2');
    expect(email.html).toContain('src="https://cosplit.site/icons/co-split-icon.png"');
    expect(email.html).toContain('Open workspace');
    expect(email.html).toContain('<table role="presentation"');
  });

  it('removes line breaks from the email subject', () => {
    const email = buildExpenseEmail({
      workspaceName: 'Roommates\nUpdates',
      description: 'Dinner\r\nNew subject',
      amount: 10,
      currency: 'USD',
      workspaceUrl: 'https://cosplit.site/workspace/abc',
      logoUrl: 'https://cosplit.site/icons/co-split-icon.png',
    });

    expect(email.subject).toBe('New expense in Roommates Updates: Dinner New subject');
  });

  it('uses bounded retry delays', () => {
    expect(getRetryDelayMs(1)).toBe(60_000);
    expect(getRetryDelayMs(2)).toBe(300_000);
    expect(getRetryDelayMs(5)).toBe(7_200_000);
    expect(getRetryDelayMs(8)).toBe(7_200_000);
  });
});
