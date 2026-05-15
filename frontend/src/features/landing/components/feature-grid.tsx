'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Priority Scheduling',
    description:
      'Four-tier priority system ensures critical jobs always process first. No starvation, no delays.',
    icon: '⚡',
  },
  {
    title: 'Smart Retries',
    description:
      'Exponential backoff with configurable max retries. Failed jobs retry automatically without intervention.',
    icon: '🔄',
  },
  {
    title: 'Circuit Breakers',
    description:
      'Automatic circuit breaking prevents cascading failures. Half-open testing ensures graceful recovery.',
    icon: '🛡️',
  },
  {
    title: 'Dead Letter Queue',
    description:
      'Permanently failed jobs are preserved for inspection. Replay or delete with one click.',
    icon: '📬',
  },
  {
    title: 'Real-time Dashboard',
    description:
      'Live WebSocket updates. Monitor jobs, workers, and queue depth in real time.',
    icon: '📊',
  },
  {
    title: 'Worker Pool',
    description:
      'Configurable concurrency with worker health monitoring. Scale workers independently.',
    icon: '⚙️',
  },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-neutral-100 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-indigo-600">
            Built for production
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Everything you need for reliable job processing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            Enterprise-grade features out of the box. No plugins, no config
            hell — just a job queue that works.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="group rounded-2xl border border-neutral-100 p-6 transition-all duration-300 hover:border-neutral-200 hover:shadow-lg hover:shadow-neutral-100/50"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="border-t border-neutral-100 bg-neutral-50 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl px-6 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          Ready to streamline your job processing?
        </h2>
        <p className="mt-4 text-neutral-500">
          Get started in minutes. Open the dashboard, create your first job,
          and watch it process in real time.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/10"
        >
          Open Dashboard
          <span className="text-neutral-400">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
