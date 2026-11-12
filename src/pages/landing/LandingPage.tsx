import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { motion } from 'motion/react';

import { useAuth } from '@/auth/useAuth';
import { GoogleLogin } from '@/auth/GoogleLogin';
import { Footer } from '../../components/Footer';
import { LoadingPage } from '../../components/LoadingPage';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

import { LedgerMockup } from './components/LedgerMockup';
import { HowItWorks } from './components/HowItWorks';
import { LandingFeatures } from './components/LandingFeatures';

import { fadeUp, slideInRight } from '@/lib/motionVariants';

import { Button } from '@/components/ui/button';

import { SectionDivider } from '../../components/SectionDivider';
import { LandingHeader } from './components/LandingHeader';

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

  // Authentication redirect handling
  useEffect(() => {
    if (authLoading || !user) return;

    const pendingInviteCode = sessionStorage.getItem('co-split:pendingInviteCode');

    if (pendingInviteCode) {
      sessionStorage.removeItem('co-split:pendingInviteCode');

      navigate(`/join/${pendingInviteCode}`, { replace: true });
      return;
    }

    const pendingWorkspaceId = sessionStorage.getItem('co-split:pendingWorkspaceId');

    if (pendingWorkspaceId) {
      sessionStorage.removeItem('co-split:pendingWorkspaceId');

      navigate(`/workspace/${pendingWorkspaceId}`, {
        replace: true,
      });
      return;
    }

    navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col font-sans">
      <LandingHeader />

      <main id="home" className="relative isolate flex flex-1 items-center overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/10 absolute -top-40 right-0 h-96 w-96 rounded-full opacity-70 blur-3xl" />

          <div className="bg-primary/10 absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-50 blur-3xl" />
        </div>

        {/* Hero content */}
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
          {/* Hero text */}
          <motion.section
            initial="hidden"
            animate="visible"
            className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left"
          >
            <motion.h1
              variants={fadeUp}
              className="font-heading text-foreground mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Split expenses.
              <span className="text-primary mt-1 block">Stay in sync.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.12 }}
              className="text-muted-foreground mx-auto mt-6 max-w-lg text-base leading-7 sm:text-lg lg:mx-0"
            >
              Track group spending, see who owes whom, and settle shared expenses without the spreadsheet chaos.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.24 }}
              id="get-started"
              className="mt-8 flex scroll-mt-24 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:justify-start"
            >
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto sm:min-w-64">
                <GoogleLogin />
              </motion.div>

              <Button
                render={<motion.a href="#features" whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} />}
                variant="outline"
                size="lg"
                className="w-full rounded-xl sm:w-auto"
              >
                Explore features
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Legal */}
            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.32 }}
              className="text-muted-foreground mt-4 text-xs leading-relaxed"
            >
              By logging in, you agree to our{' '}
              <a href="/terms" className="hover:text-primary underline underline-offset-2 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy.html" className="hover:text-primary underline underline-offset-2 transition-colors">
                Privacy Policy
              </a>
              .
            </motion.p>
          </motion.section>

          {/* Ledger preview */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            transition={{ delay: 0.15 }}
            className="mx-auto w-full max-w-lg lg:ml-auto"
          >
            <div className="relative h-64 overflow-hidden sm:h-72 lg:h-130">
              <LedgerMockup />

              {/* Bottom fade */}
              <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t to-transparent" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Landing page sections */}
      <SectionDivider />

      <LandingFeatures />

      <SectionDivider />

      <HowItWorks />

      <SectionDivider />

      <Footer className="relative z-10 mt-auto" />
    </div>
  );
};
