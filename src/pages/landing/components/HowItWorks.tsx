import { UserPlusIcon, ReceiptPercentIcon, CalculatorIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

import { motion } from 'motion/react';
import { fadeUp, staggerContainer, cardReveal } from '@/lib/motionVariants';

const steps = [
  {
    number: '01',
    icon: UserPlusIcon,
    title: 'Create a workspace',
    description: 'Start a group for your friends, roommates, or teammates and invite everyone to join.',
  },
  {
    number: '02',
    icon: ReceiptPercentIcon,
    title: 'Record expenses',
    description: 'Add shared expenses, specify who paid, and assign the members responsible for each cost.',
  },
  {
    number: '03',
    icon: CalculatorIcon,
    title: 'Calculate balances',
    description: 'Co-Split tracks each member’s share and calculates who owes whom.',
  },
  {
    number: '04',
    icon: CheckCircleIcon,
    title: 'Settle up',
    description: 'Follow the settlement plan to see how your group can clear outstanding balances.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <span className="text-primary text-xs font-bold tracking-[0.18em] uppercase">Simple from start to finish</span>

        <h2 className="font-heading text-foreground mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          How it works
        </h2>

        <p className="text-muted-foreground mt-4 text-sm leading-7 sm:text-base">
          Manage shared expenses in four straightforward steps. No complicated spreadsheets or endless calculations.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map(({ number, icon: Icon, title, description }, index) => (
          <motion.article key={number} variants={cardReveal} className="group relative">
            {index < steps.length - 1 && (
              <>
                {/* Mobile vertical connector */}
                <motion.div
                  aria-hidden="true"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: 0.2,
                    ease: 'easeOut',
                  }}
                  className="bg-border absolute top-14 left-[1.375rem] h-[calc(100%+1.5rem)] w-px origin-top sm:hidden"
                />

                {/* Desktop horizontal connector */}
                <motion.div
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.25,
                    ease: 'easeOut',
                  }}
                  className="border-border absolute top-7 -right-3 left-[calc(50%+2rem)] hidden origin-left border-t border-dashed lg:block"
                />
              </>
            )}

            <div className="hover:border-border hover:bg-card relative flex gap-5 rounded-xl border border-transparent p-4 transition-all duration-300 hover:shadow-sm sm:flex-col sm:items-center sm:text-center">
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.2 }}
                className="border-primary/15 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300"
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </motion.div>

              {/* Content */}
              <div className="relative z-10 flex-1 sm:mt-2">
                <span className="text-primary text-xs font-bold tracking-widest">STEP {number}</span>

                <h3 className="font-heading text-card-foreground mt-2 text-lg font-bold">{title}</h3>

                <p className="text-muted-foreground mt-3 text-sm leading-6">{description}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};
