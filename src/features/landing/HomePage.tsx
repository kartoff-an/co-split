import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  BoltIcon,
  UserPlusIcon,
  CalculatorIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../auth/useAuth';
import { GoogleLogin } from '../auth/GoogleLogin';
import { CoSplitIcon } from '../../components/CoSplitIcon';
import { Spinner } from '../../components/Spinner';
import { Footer } from '../../components/Footer';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { LedgerMockup } from './LedgerMockup';
import { HowItWorks } from './HowItWorks';

const features = [
  {
    icon: BoltIcon,
    number: '01',
    title: 'Everyone stays in sync',
    description:
      'Expenses and settlements stay up to date, so your group always works from the same numbers.',
  },
  {
    icon: UserPlusIcon,
    number: '02',
    title: 'Bring your group together',
    description:
      'Invite friends, roommates, or teammates to a shared workspace with a link or workspace ID.',
  },
  {
    icon: CalculatorIcon,
    number: '03',
    title: 'Settle with clarity',
    description:
      'Understand every member’s net balance and see a simplified plan for settling what is owed.',
  },
];

const LandingHeader: React.FC = () => (
  <header className="sticky top-0 z-30 border-b border-border-subtle bg-app/95 backdrop-blur-sm">
    <nav
      aria-label="Main navigation"
      className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12"
    >
      <a href="#home" aria-label="Co-Split home" className="flex items-center gap-2.5">
        <CoSplitIcon />
        <span className="text-text-primary text-base font-bold tracking-tight">Co-Split</span>
      </a>

      <div className="flex items-center gap-4 sm:gap-7">
        <a href="#features" className="hidden text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary sm:block">
          Features
        </a>
        <a href="#how-it-works" className="hidden text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary sm:block">
          How it works
        </a>
        <ThemeToggle />
        <a href="#get-started" className="inline-flex min-h-9 items-center gap-2 rounded-md bg-primary-green px-3.5 text-sm font-semibold text-app transition-colors duration-150 hover:bg-primary-green-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-green">
          Get started
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </nav>
  </header>
);

const LandingFeatures: React.FC = () => (
  <section
    id="features"
    className="scroll-mt-20 border-y border-border-subtle bg-surface"
  >
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-primary-green text-xs font-bold tracking-[0.16em] uppercase">
            Less awkward. More organized.
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
            Shared expenses, <span className="text-primary-green">sorted.</span>
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-text-secondary sm:text-right">
          Everything your group needs to track spending and settle up with confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-0 border border-border-subtle md:grid-cols-3">
        {features.map(({ icon: Icon, number, title, description }, index) => (
          <article
            key={number}
            className={`landing-reveal group p-5 transition-colors duration-200 hover:bg-surface-subtle sm:p-6 ${index < features.length - 1 ? 'border-b border-border-subtle md:border-r md:border-b-0' : ''}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="mb-8 flex items-center justify-between">
              <Icon className="h-5 w-5 text-primary-green" strokeWidth={1.7} />
              <span className="font-mono text-xs tabular-nums text-text-muted">{number}</span>
            </div>
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            <div className="mt-5 h-px w-8 bg-primary-green/60 transition-[width] duration-200 group-hover:w-14" />
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cosplit.site';

  useDocumentMetadata({
    title: 'Co-Split — Shared expenses, sorted',
    description:
      'Track group spending, understand balances, and settle shared expenses with Co-Split.',
    url: origin,
    image: `${origin}/icons/co-split-icon.png`,
  });

  useEffect(() => {
    if (!authLoading && user) {
      const pendingInviteCode = sessionStorage.getItem('co-split:pendingInviteCode');
      if (pendingInviteCode) {
        sessionStorage.removeItem('co-split:pendingInviteCode');
        navigate(`/join/${pendingInviteCode}`, { replace: true });
        return;
      }

      const pendingWorkspaceId = sessionStorage.getItem('co-split:pendingWorkspaceId');
      if (pendingWorkspaceId) {
        sessionStorage.removeItem('co-split:pendingWorkspaceId');
        navigate(`/workspace/${pendingWorkspaceId}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-10 w-10 text-primary-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app font-sans text-text-primary">
      <LandingHeader />

      <main id="home">
        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:px-12 lg:py-20">
          <div className="landing-reveal lg:col-span-5">
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary-green uppercase">
              <span className="h-1.5 w-1.5 bg-primary-green" />
              Shared spending, made simple
            </p>
            <h1 className="max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
              Split expenses.
              <span className="mt-1 block text-primary-green">Stay in sync.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-text-secondary sm:text-lg">
              Track group spending, see who owes whom, and settle shared expenses without spreadsheet chaos.
            </p>

            <div id="get-started" className="scroll-mt-24 mt-7 max-w-md">
              <div className="border border-border-subtle bg-surface p-5 sm:p-6">
                <h2 className="text-sm font-semibold tracking-tight">Access your workspace</h2>
                <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                  Sign in to create a group, record expenses, and keep everyone on the same page.
                </p>
                <div className="mt-5">
                  <GoogleLogin />
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-text-muted">
                By logging in, you agree to our{' '}
                <a href="/terms" className="underline underline-offset-2 transition-colors hover:text-primary-green">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy.html" className="underline underline-offset-2 transition-colors hover:text-primary-green">Privacy Policy</a>.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5"><CheckIcon className="h-4 w-4 text-primary-green" /> Shared workspace</span>
              <span className="inline-flex items-center gap-1.5"><CheckIcon className="h-4 w-4 text-primary-green" /> Clear balances</span>
              <span className="inline-flex items-center gap-1.5"><CheckIcon className="h-4 w-4 text-primary-green" /> Simplified settlements</span>
            </div>
          </div>

          <div className="landing-reveal min-w-0 lg:col-span-7" style={{ animationDelay: '100ms' }}>
            <LedgerMockup />
            <p className="mt-3 text-center text-xs text-text-muted">
              Example workspace preview · Illustrative data
            </p>
          </div>
        </section>

        <LandingFeatures />
        <HowItWorks />

        <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="flex flex-col gap-6 border border-border-subtle bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-primary-green uppercase">Ready when you are</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Make shared spending easier.</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Bring your group’s expenses and balances into one clear workspace.</p>
            </div>
            <a href="#get-started" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary-green px-4 text-sm font-semibold text-app transition-colors duration-150 hover:bg-primary-green-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-green">
              Get started <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer className="mt-8" />
    </div>
  );
};
