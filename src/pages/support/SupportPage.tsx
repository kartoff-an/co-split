import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CaretDownIcon,
  EnvelopeSimpleIcon,
  ReceiptIcon,
  ArrowsLeftRightIcon,
  ShieldCheckIcon,
  LifebuoyIcon,
} from '@phosphor-icons/react';

import { motion, AnimatePresence } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    category: 'Getting Started',
    icon: LifebuoyIcon,
    questions: [
      {
        question: 'What is Co-Split?',
        answer:
          'Co-Split is a collaborative expense management app that helps groups record shared expenses, split costs among members, and keep track of outstanding balances.',
      },
      {
        question: 'How do I create a workspace?',
        answer:
          'Create a workspace to organize expenses for a group, trip, household, or other shared activity. Workspace members can participate in recording and managing shared expenses.',
      },
      {
        question: 'How do I invite people to my workspace?',
        answer:
          'Use your workspace invitation link to invite other people. Anyone joining through the invitation can become a member of that workspace.',
      },
    ],
  },
  {
    category: 'Expenses',
    icon: ReceiptIcon,
    questions: [
      {
        question: 'How do I add an expense?',
        answer:
          'Record an expense by providing its description, amount, category, payer, and the members participating in the split.',
      },
      {
        question: 'How are expenses split?',
        answer:
          'Co-Split calculates each participant’s share based on the expense split information recorded. The resulting balances help members understand who owes whom.',
      },
      {
        question: 'Can I record a payment between members?',
        answer:
          'Yes. You can record a settlement in Co-Split to reflect a payment made between members. The actual transfer happens outside the app.',
      },
    ],
  },
  {
    category: 'Balances and Settlements',
    icon: ArrowsLeftRightIcon,
    questions: [
      {
        question: 'Does Co-Split transfer money?',
        answer:
          'No. Co-Split does not process payments, hold funds, or transfer money. It records expenses and settlements so members can keep track of shared financial obligations.',
      },
      {
        question: 'Does recording a settlement automatically send money?',
        answer:
          'No. A settlement is a record of a payment that members have made outside Co-Split. Make sure the actual payment has been completed before recording it.',
      },
    ],
  },
  {
    category: 'Account and Privacy',
    icon: ShieldCheckIcon,
    questions: [
      {
        question: 'How do I sign in?',
        answer: 'Co-Split supports signing in using your Google account.',
      },
      {
        question: 'What happens to expenses when a workspace is deleted?',
        answer:
          'Deleting a workspace also deletes its associated expenses and memberships. Make sure you understand the consequences before deleting a workspace.',
      },
      {
        question: 'How is my information handled?',
        answer:
          'Read our Privacy Policy to understand what information Co-Split collects, how it is used, and how it is shared.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-border border-b last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-foreground font-medium">{question}</span>

        <CaretDownIcon
          size={18}
          weight="bold"
          className={`text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground pr-8 pb-5 text-sm leading-7">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Support() {
  const navigate = useNavigate();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground mb-8 -ml-3 gap-2">
          <ArrowLeftIcon size={18} weight="bold" />
          Back
        </Button>

        {/* Header */}
        <section className="mb-12">
          <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-2xl">
            <LifebuoyIcon size={26} weight="duotone" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How can we help?</h1>

          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            Find answers to common questions about Co-Split, managing shared expenses, and keeping track of group
            balances.
          </p>
        </section>

        {/* Contact Support */}
        <Card className="border-border bg-card mb-14 overflow-hidden shadow-sm">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                <EnvelopeSimpleIcon size={23} weight="duotone" />
              </div>

              <div>
                <h2 className="text-foreground font-semibold">Still need help?</h2>

                <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
                  Can't find what you're looking for? Send us an email and describe the issue you're experiencing.
                </p>
              </div>
            </div>

            <a
              href="mailto:cosplit.mail@gmail.com?subject=Co-Split%20Support"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Contact Support
              <ArrowUpRightIcon size={16} weight="bold" />
            </a>
          </CardContent>
        </Card>

        {/* FAQ */}
        <section>
          <div className="mb-7">
            <p className="text-primary text-sm font-medium">Help Center</p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight">Frequently asked questions</h2>

            <p className="text-muted-foreground mt-2 text-sm">
              Quick answers to help you get the most out of Co-Split.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((group) => {
              const Icon = group.icon;

              return (
                <section key={group.category}>
                  <div className="mb-3 flex items-center gap-2">
                    <Icon size={19} weight="duotone" className="text-primary" />

                    <h3 className="font-semibold">{group.category}</h3>
                  </div>

                  <Card className="border-border bg-card shadow-sm">
                    <CardContent className="px-5">
                      {group.questions.map((faq) => (
                        <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              );
            })}
          </div>
        </section>

        {/* Legal Links */}
        <section className="border-border mt-14 border-t pt-8">
          <h2 className="font-semibold">More information</h2>

          <p className="text-muted-foreground mt-2 text-sm">
            Learn more about using Co-Split and how your information is handled.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/terms"
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
            >
              Terms and Conditions
              <ArrowUpRightIcon size={14} />
            </Link>

            <Link
              to="/privacy"
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
            >
              Privacy Policy
              <ArrowUpRightIcon size={14} />
            </Link>
          </div>
        </section>

        <footer className="border-border mt-12 border-t pt-6">
          <p className="text-muted-foreground text-sm">Co-Split — Shared expenses, made simple.</p>
        </footer>
      </div>
    </main>
  );
}
