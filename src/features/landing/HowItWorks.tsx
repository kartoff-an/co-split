import React from 'react';
import {
  UserPlusIcon,
  ReceiptPercentIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    number: '01',
    icon: UserPlusIcon,
    title: 'Create a workspace',
    description: 'Start a group for friends, roommates, or teammates and invite everyone to join.',
  },
  {
    number: '02',
    icon: ReceiptPercentIcon,
    title: 'Record expenses',
    description: 'Add what was paid, who paid it, and which members should share the cost.',
  },
  {
    number: '03',
    icon: CalculatorIcon,
    title: 'Review balances',
    description: 'Co-Split tracks each member’s share and shows who owes whom.',
  },
  {
    number: '04',
    icon: CheckCircleIcon,
    title: 'Settle up',
    description: 'Use the settlement plan to see how your group can clear outstanding balances.',
  },
];

export const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="scroll-mt-20">
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold tracking-[0.16em] text-primary-green uppercase">A clearer way to split</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">How it works</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
          From the first shared bill to the final repayment, keep the whole process organized in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 border border-border-subtle bg-surface sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ number, icon: Icon, title, description }, index) => (
          <article
            key={number}
            className={`landing-reveal relative p-5 sm:p-6 ${index < 3 ? 'border-b border-border-subtle' : ''} ${index % 2 === 0 && index < 3 ? 'sm:border-r' : ''} lg:border-b-0 ${index < 3 ? 'lg:border-r' : ''}`}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-text-muted">{number}</span>
              <Icon className="h-5 w-5 text-primary-green" strokeWidth={1.7} />
            </div>
            <div className="mt-8 flex items-center gap-2 text-primary-green">
              <span className="h-px w-6 bg-primary-green/60" />
              {index < steps.length - 1 && <ArrowRightIcon className="hidden h-3.5 w-3.5 lg:block" />}
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
