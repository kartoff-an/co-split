import { UserPlusIcon, ReceiptPercentIcon, CalculatorIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, cardReveal } from '../../lib/motionVariants';

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
        <span className="text-primary-green text-xs font-bold tracking-[0.18em] uppercase">
          Simple from start to finish
        </span>

        <h2 className="text-text-primary mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>

        <p className="text-text-secondary mt-4 text-sm leading-7 sm:text-base">
          Manage shared expenses in four straightforward steps. No complicated spreadsheets or endless calculations.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      >
        {steps.map(({ number, icon: Icon, title, description }, index) => (
          <motion.article key={number} variants={cardReveal} className="relative">
            {index < steps.length - 1 && (
              <>
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
                  className="bg-border-subtle absolute top-14 left-6 h-[calc(100%+2.5rem)] w-px origin-top sm:hidden"
                />

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
                  className="border-border-subtle absolute top-6 -right-6 left-[calc(50%+2rem)] hidden origin-left border-t border-dashed lg:block"
                />
              </>
            )}

            <div className="relative flex gap-5 sm:flex-col sm:items-center sm:text-center">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.2 }}
                className="bg-surface-subtle text-text-secondary flex h-11 w-11 items-center justify-center rounded-lg"
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </motion.div>

              <div className="relative z-10 flex-1 sm:mt-2">
                <span className="text-primary-green text-xs font-bold tracking-widest">STEP {number}</span>

                <h3 className="text-text-primary mt-2 text-lg font-bold">{title}</h3>

                <p className="text-text-secondary mt-3 text-sm leading-6">{description}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};
