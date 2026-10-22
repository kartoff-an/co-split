import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { GoogleLogin } from '../auth/GoogleLogin';
import { ArrowRightIcon, BoltIcon, UserPlusIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { CoSplitIcon } from '../../components/CoSplitIcon';
import { Footer } from '../../components/Footer';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { Button } from '../../components/Button';
import { LoadingPage } from '../../components/LoadingPage';
import { LedgerMockup } from './LedgerMockup';
import { ScrollReveal } from '../../components/ScrollReveal';

const LandingHeader: React.FC = () => {
  return (
    <header className="border-border-subtle bg-surface/90 sticky top-0 z-20 border-b backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <a href="/" aria-label="Co-Split home" className="flex items-center gap-2.5">
          <CoSplitIcon />
          <span className="text-text-primary text-lg font-extrabold tracking-tight">Co-Split</span>
        </a>

        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="#home"
            className="text-text-secondary hover:text-text-primary hidden text-sm font-medium transition-colors sm:block"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-text-secondary hover:text-text-primary hidden text-sm font-medium transition-colors sm:block"
          >
            Features
          </a>
          <a href="#get-started">
            <Button size="md" className="rounded-lg px-4">
              Get Started
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </nav>
    </header>
  );
};

const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: BoltIcon,
      number: '01',
      eyebrow: 'STAY IN SYNC',
      title: 'Everyone stays on the same page.',
      description:
        'Expenses and settlements update across your workspace, so everyone sees the same numbers without chasing screenshots or messages.',
    },
    {
      icon: UserPlusIcon,
      number: '02',
      eyebrow: 'BRING YOUR GROUP TOGETHER',
      title: 'Getting everyone onboard is easy.',
      description:
        'Create a workspace and invite your friends, roommates, or project teammates with a workspace ID or invitation link.',
    },
    {
      icon: CalculatorIcon,
      number: '03',
      eyebrow: 'SETTLE WITH CLARITY',
      title: 'Know exactly who owes whom.',
      description:
        'See each member’s net balance and get a simplified settlement plan that reduces the number of payments your group needs.',
    },
  ];

  return (
    <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <span className="text-primary-green text-xs font-bold tracking-[0.18em] uppercase">
            Less awkward. More organized.
          </span>

          <h2 className="text-text-primary mt-3 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            Shared expenses,
            <span className="text-primary-green"> sorted.</span>
          </h2>

          <p className="text-text-secondary mt-4 max-w-xl text-sm leading-6 sm:text-base sm:leading-7">
            Everything your group needs to track spending and settle up with confidence.
          </p>
        </div>

        <a
          href="#get-started"
          className="text-primary-green hover:text-primary-green-hover inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold transition-colors"
        >
          Get started
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {features.map(({ icon: Icon, number, eyebrow, title, description }) => (
          <article
            key={number}
            className="group border-border-subtle bg-surface relative flex flex-col rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div className="bg-surface-subtle text-text-secondary flex h-11 w-11 items-center justify-center rounded-full">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>

              <span className="text-text-muted text-sm font-semibold tabular-nums">{number}</span>
            </div>

            <p className="text-primary-green mt-7 text-[10px] font-bold tracking-[0.16em] uppercase">{eyebrow}</p>

            <h3 className="text-text-primary mt-2 text-xl leading-snug font-bold tracking-tight">{title}</h3>

            <p className="text-text-secondary mt-3 flex-1 text-sm leading-6">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cosplit.site';

  useDocumentMetadata({
    title: 'Co-Split - Fair Expense Splitting Made Simple',
    description:
      'Track shared expenses, manage group spending, and settle balances with Co-Split. Keep your workspace organized without spreadsheet chaos.',
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
    return <LoadingPage />;
  }

  return (
    <div className="bg-app text-text-primary flex min-h-screen flex-col font-sans">
      <LandingHeader />

      <main id="home" className="relative isolate flex flex-1 items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary-green-light absolute -top-40 right-0 h-96 w-96 rounded-full opacity-50 blur-3xl" />
          <div className="bg-primary-green-light absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-30 blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
          <section className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
            <ScrollReveal direction="up">
              <h1 className="text-text-primary mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Split expenses.
                <span className="text-primary-green mt-1 block">Stay in sync.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <p className="text-text-secondary mx-auto mt-6 max-w-lg text-base leading-7 sm:text-lg lg:mx-0">
                Track group spending, see who owes whom, and settle shared expenses without the spreadsheet chaos.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div
                id="get-started"
                className="mt-8 flex scroll-mt-24 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:justify-start"
              >
                <div className="w-full sm:w-auto sm:min-w-64">
                  <GoogleLogin />
                </div>

                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full rounded-xl">
                    Explore features
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              <p className="text-text-muted mt-4 text-xs leading-relaxed">
                By logging in, you agree to our{' '}
                <a href="/terms" className="text-text-secondary hover:text-primary-green underline underline-offset-2">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-text-secondary hover:text-primary-green underline underline-offset-2"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </ScrollReveal>
          </section>

          <ScrollReveal direction="right" delay={150} className="mx-auto w-full max-w-lg lg:ml-auto">
            <div className="relative h-64 overflow-hidden sm:h-72 lg:h-130">
              <LedgerMockup />

              <div className="from-app pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t to-transparent" />
            </div>

            <p className="text-text-muted mt-2 text-center text-xs">Example workspace preview · Illustrative data</p>
          </ScrollReveal>
        </div>
      </main>

      <LandingFeatures />

      <Footer className="relative z-10 mt-auto" />
    </div>
  );
};
