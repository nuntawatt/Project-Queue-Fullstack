export const APP_CONFIG = {
  name: 'Queuely',
  description: 'Enterprise-grade distributed job queue management',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000',
    key: process.env.NEXT_PUBLIC_API_KEY ?? 'queuely-dev-secret',
  },
  polling: {
    metricsInterval: 10_000,
    staleTime: 5_000,
  },
} as const;

export const JOB_TYPES = ['send_email', 'process_image'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const DEFAULT_PAYLOADS: Record<JobType, string> = {
  send_email: JSON.stringify(
    { to: 'user@example.com', subject: 'Hello' },
    null,
    2,
  ),
  process_image: JSON.stringify(
    { url: 'https://example.com/image.jpg', operation: 'resize' },
    null,
    2,
  ),
};
