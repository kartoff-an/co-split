import { ArrowRightIcon, BoltIcon, UserPlusIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { motion } from 'motion/react';
import { cardReveal, fadeUp, staggerContainer } from '../../lib/motionVariants';

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

export const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-2xl">
          <span className="text-primary-green text-xs font-bold uppercase">Less awkward. More organized.</span>

          <h2 className="text-text-primary mt-3 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            Shared expenses,
            <span className="text-primary-green"> sorted.</span>
          </h2>

          <p className="text-text-secondary mt-4 max-w-xl text-sm leading-6 sm:text-base sm:leading-7">
            Everything your group needs to track spending and settle up with confidence.
          </p>
        </div>

        <motion.a
          href="#get-started"
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="text-primary-green hover:text-primary-green-hover inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold"
        >
          Get started
          <ArrowRightIcon className="h-4 w-4" />
        </motion.a>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
      >
        {features.map(({ icon: Icon, number, eyebrow, title, description }) => (
          <motion.article
            key={number}
            variants={cardReveal}
            whileHover={{
              y: -4,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            className="group border-border-subtle bg-surface relative flex flex-col rounded-xl border p-6 transition-colors duration-200 sm:p-7"
          >
            <div className="flex items-start justify-between">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.2 }}
                className="bg-surface-subtle text-text-secondary flex h-11 w-11 items-center justify-center rounded-lg"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </motion.div>

              <span className="text-text-muted text-sm font-semibold tabular-nums">{number}</span>
            </div>

            <p className="text-primary-green mt-7 text-[10px] font-bold uppercase">{eyebrow}</p>

            <h3 className="text-text-primary mt-2 text-xl leading-snug font-bold">{title}</h3>

            <div
              aria-hidden="true"
              className="bg-primary-green mt-2 h-1 w-10 origin-left transition-all duration-300 ease-out group-hover:w-20 motion-reduce:transition-none"
            />

            <p className="text-text-secondary mt-3 flex-1 text-sm leading-6">{description}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};
