export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiKey: process.env.API_KEY ?? 'queuely-dev-secret',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'queue',
  },

  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10),
    pollIntervalMs: parseInt(process.env.WORKER_POLL_INTERVAL_MS ?? '500', 10),
    jobTimeoutMs: parseInt(process.env.JOB_TIMEOUT_MS ?? '30000', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
  },

  circuitBreaker: {
    failureThreshold: parseInt(process.env.CB_FAILURE_THRESHOLD ?? '5', 10),
    successThreshold: parseInt(process.env.CB_SUCCESS_THRESHOLD ?? '2', 10),
    timeoutMs: parseInt(process.env.CB_TIMEOUT_MS ?? '10000', 10),
  },
});
