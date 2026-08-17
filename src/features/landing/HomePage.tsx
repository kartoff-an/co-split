import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { GoogleLogin } from '../auth/GoogleLogin';
import { LedgerMockup } from './LedgerMockup';
import {
  BoltIcon,
  UserPlusIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import { CoSplitIcon } from '../../components/CoSplitIcon';
import { Spinner } from '../../components/Spinner';
import { Footer } from '../../components/Footer';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cosplit.site/';
  useDocumentMetadata({
    title: 'Co-Split - Fair Expense Splitting Made Simple',
    description: 'Frictionless shared expense ledger sheets. Sign in with one click to organize bills with your workspace team, roommates, or study group in real-time.',
    url: origin,
    image: `${origin}/icons/co-split-icon.png`
  });

  useEffect(() => {
    if (!authLoading && user) {
      const pendingInviteCode = sessionStorage.getItem(
        'co-split:pendingInviteCode'
      );
      if (pendingInviteCode) {
        sessionStorage.removeItem('co-split:pendingInviteCode');
        navigate(`/join/${pendingInviteCode}`, { replace: true });
        return;
      }

      const pendingWorkspaceId = sessionStorage.getItem(
        'co-split:pendingWorkspaceId'
      );
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
      <div className="bg-mesh-light flex min-h-screen items-center justify-center">
        <Spinner className="text-primary-green h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="bg-mesh-light relative flex min-h-screen flex-col justify-between overflow-hidden px-4 py-10 font-sans text-text-primary md:px-8">
      <div className="bg-primary-green-light/45 pointer-events-none absolute top-[8%] left-[-5%] -z-10 h-[380px] w-[380px] rounded-full opacity-60 blur-3xl filter [data-theme='dark']_&:opacity-20" />
      <div className="pointer-events-none absolute right-[-5%] bottom-[20%] -z-10 h-[420px] w-[420px] rounded-full bg-amber-50 opacity-50 blur-3xl filter [data-theme='dark']_&:opacity-10" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-border-subtle pb-6 select-none">
        <div className="flex items-center gap-2">
          <CoSplitIcon />
          <span className="text-lg font-extrabold tracking-tight text-text-primary">
            Co-Split
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 py-12 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <section className="animate-fade-in space-y-8 text-left lg:col-span-7">
          <div className="space-y-4">
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-text-primary sm:text-5xl md:text-5xl">
              Group expenses,
              <br />
              <span className="text-primary-green relative inline-block">
                Simplified.
                <svg
                  className="text-accent-coral/65 absolute bottom-[-6px] left-0 h-[8px] w-full"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,5 Q50,9 100,5"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="max-w-xl pt-2 text-sm leading-relaxed font-medium text-text-secondary sm:text-base">
              Frictionless shared expense ledger sheets. Sign in with one click
              to organize bills with your workspace team, roommates, or study
              group in real-time.
            </p>
          </div>

          <div className="relative w-full max-w-md pt-4">
            <div className="glass-card group relative rounded-2xl p-6 shadow-xs">
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute top-2.5 left-2.5 h-2 w-2 border-t border-l transition-colors" />
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 border-t border-r transition-colors" />
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute bottom-2.5 left-2.5 h-2 w-2 border-b border-l transition-colors" />
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute right-2.5 bottom-2.5 h-2 w-2 border-r border-b transition-colors" />

              <div className="mb-6 text-left">
                <h2 className="text-base font-bold tracking-tight text-text-primary">
                  Access your workspace
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                  Sign in with Google to create secure bill ledgers, collaborate
                  in real-time, and split expenses instantly with your group.
                </p>
              </div>

              <GoogleLogin />
            </div>
          </div>
        </section>

        <section className="animate-slide-up relative select-none lg:col-span-5">
          <LedgerMockup />
        </section>
      </main>

      <div className="relative mx-auto flex w-full max-w-6xl items-center py-4 select-none">
        <div className="border-border-subtle grow border-t border-dashed"></div>
        <span className="shadow-3xs mx-4 shrink rounded-full border border-border-subtle bg-surface px-3 py-1 text-[9px] font-extrabold tracking-widest text-text-muted uppercase">
          Built for teams
        </span>
        <div className="border-border-subtle grow border-t border-dashed"></div>
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 py-4 text-left sm:grid-cols-3">
        <div className="space-y-3">
          <div className="bg-primary-green-light text-primary-green shadow-3xs flex h-10 w-10 items-center justify-center rounded-xl">
            <BoltIcon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-extrabold tracking-tight text-text-primary">
            Real-Time Collaboration
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary">
            Every transaction and settlement propagates instantly to all active
            member screens.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-primary-green-light text-primary-green shadow-3xs flex h-10 w-10 items-center justify-center rounded-xl">
            <UserPlusIcon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-extrabold tracking-tight text-text-primary">
            Seamless Group Invites
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary">
            Invite members immediately with a simple workspace ID key, a direct
            invitation link, or a template message.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-primary-green-light text-primary-green shadow-3xs flex h-10 w-10 items-center justify-center rounded-xl">
            <CalculatorIcon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-extrabold tracking-tight text-text-primary">
            Automated Settlement Engine
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary">
            Automatically calculates net member balances and optimizes
            transactions so group bills are settled in the fewest transfers.
          </p>
        </div>
      </section>

      <Footer className="relative z-10 mt-24" />
    </div>
  );
};
