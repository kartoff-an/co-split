import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GoogleLogin } from '../components/GoogleLogin';
import { LedgerMockup } from '../components/LedgerMockup';
import {
  BoltIcon,
  UserPlusIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import { CoSplitIcon } from '../components/CoSplitIcon';
import { Spinner } from '../components/Spinner';
import { Footer } from '../components/Footer';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

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
    <div className="bg-mesh-light relative flex min-h-screen flex-col justify-between overflow-hidden px-4 py-10 font-sans md:px-8">
      <div className="bg-primary-green-light/45 pointer-events-none absolute top-[8%] left-[-5%] -z-10 h-[380px] w-[380px] rounded-full opacity-60 blur-3xl filter" />
      <div className="pointer-events-none absolute right-[-5%] bottom-[20%] -z-10 h-[420px] w-[420px] rounded-full bg-amber-50 opacity-50 blur-3xl filter" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-slate-100/60 pb-6 select-none">
        <div className="flex items-center gap-2">
          <CoSplitIcon />
          <span className="text-lg font-extrabold tracking-tight text-slate-800">
            Co-Split
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 py-12 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <section className="animate-fade-in space-y-8 text-left lg:col-span-7">
          <div className="space-y-4">
            <div className="bg-primary-green-light/80 border-primary-green-light text-primary-green shadow-3xs inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold">
              Frictionless expense ledger
            </div>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-slate-800 sm:text-5xl md:text-5xl">
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
            <p className="max-w-xl pt-2 text-sm leading-relaxed font-medium text-slate-500 sm:text-base">
              Frictionless shared expense ledger sheets. Sign in with one click
              to organize bills with your workspace team, roommates, or study
              group in real-time.
            </p>
          </div>

          <div className="relative w-full max-w-md pt-4">
            <div className="pointer-events-none absolute top-[-35px] right-[-65px] hidden rotate-[10deg] text-slate-400 select-none xl:block">
              <span className="text-accent-coral mb-1 block text-[10px] font-bold">
                Check the live view
              </span>
              <svg
                className="text-accent-coral/60 h-10 w-10"
                viewBox="0 0 50 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M10 10 Q25 40 40 20" strokeLinecap="round" />
                <path d="M28 18 L40 20 L38 32" strokeLinecap="round" />
              </svg>
            </div>

            <div className="glass-card group relative rounded-2xl border border-slate-100 p-6 shadow-xs transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute top-2.5 left-2.5 h-2 w-2 border-t border-l transition-colors" />
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 border-t border-r transition-colors" />
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute bottom-2.5 left-2.5 h-2 w-2 border-b border-l transition-colors" />
              <div className="border-primary-green/20 group-hover:border-primary-green/45 pointer-events-none absolute right-2.5 bottom-2.5 h-2 w-2 border-r border-b transition-colors" />

              <div className="mb-6 text-left">
                <h2 className="text-base font-bold tracking-tight text-slate-800">
                  Access your workspace
                </h2>
                <p className="text-slate-455 mt-1 text-[11px] leading-relaxed">
                  Sign in with Google to create secure bill ledgers, collaborate
                  in real-time, and split expenses instantly with your group.
                </p>
              </div>

              <GoogleLogin />
            </div>
          </div>
        </section>

        <section className="animate-slide-up relative select-none lg:col-span-5">
          <div className="bg-primary-green-light/45 absolute inset-[-15px] -z-10 rotate-3 rounded-3xl blur-xl filter" />
          <LedgerMockup />
        </section>
      </main>

      <div className="relative mx-auto flex w-full max-w-6xl items-center py-4 select-none">
        <div className="border-slate-150 grow border-t border-dashed"></div>
        <span className="shadow-3xs mx-4 shrink rounded-full border border-slate-200/60 bg-white px-3 py-1 text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
          Built for teams
        </span>
        <div className="border-slate-150 grow border-t border-dashed"></div>
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 py-4 text-left sm:grid-cols-3">
        <div className="space-y-3">
          <div className="bg-primary-green-light text-primary-green shadow-3xs flex h-10 w-10 items-center justify-center rounded-xl">
            <BoltIcon className="h-5 w-5" />
          </div>
          <h3 className="text-slate-855 text-sm font-extrabold tracking-tight">
            Real-Time Collaboration
          </h3>
          <p className="text-slate-450 text-xs leading-relaxed">
            Every transaction and settlement propagates instantly to all active
            member screens via automated ledger subscriptions.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-primary-green-light text-primary-green shadow-3xs flex h-10 w-10 items-center justify-center rounded-xl">
            <UserPlusIcon className="h-5 w-5" />
          </div>
          <h3 className="text-slate-855 text-sm font-extrabold tracking-tight">
            Seamless Group Invites
          </h3>
          <p className="text-slate-450 text-xs leading-relaxed">
            Invite members immediately with a simple workspace ID key, a direct
            invitation link, or a template message.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-primary-green-light text-primary-green shadow-3xs flex h-10 w-10 items-center justify-center rounded-xl">
            <CalculatorIcon className="h-5 w-5" />
          </div>
          <h3 className="text-slate-855 text-sm font-extrabold tracking-tight">
            Automated Settlement Engine
          </h3>
          <p className="text-slate-450 text-xs leading-relaxed">
            Automatically calculates net member balances and optimizes
            transactions so group bills are settled in the fewest transfers.
          </p>
        </div>
      </section>

      <Footer className="relative z-10 mt-24" />
    </div>
  );
};
