/** Metrics response shape from the backend */
export interface MetricsResponse {
  jobs: {
    total: number;
    byStatus: Record<string, number>;
    avgDurationMs: number;
  };
  queue: {
    depth: Record<string, number>;
    total: number;
  };
  dlq: {
    count: number;
  };
  workers: {
    total: number;
    busy: number;
    idle: number;
    workers: WorkerInfo[];
  };
  circuits: Record<string, CircuitInfo>;
}

export interface WorkerInfo {
  id: string;
  busy: boolean;
  processedCount: number;
}

export interface CircuitInfo {
  state: 'closed' | 'open' | 'half_open';
  failures: number;
}

/** Generic API error shape */
export interface ApiError {
  message: string;
  statusCode: number;
}
