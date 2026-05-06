export type CircuitState = 'closed' | 'open' | 'half_open';

export interface Circuit {
  state: CircuitState;
  failures: number;
  successes: number;
  openedAt: number;
  lastFailureAt: number;
}

export class CircuitBreakerEngine {
  private readonly circuits = new Map<string, Circuit>();

  constructor(
    private readonly failureThreshold: number,
    private readonly successThreshold: number,
    private readonly timeoutMs: number,
  ) {}

  private get(service: string): Circuit {
    if (!this.circuits.has(service)) {
      this.circuits.set(service, {
        state: 'closed',
        failures: 0,
        successes: 0,
        openedAt: 0,
        lastFailureAt: 0,
      });
    }
    return this.circuits.get(service)!;
  }

  canExecute(service: string): boolean {
    const c = this.get(service);
    if (c.state === 'closed') return true;
    if (c.state === 'open') {
      if (Date.now() - c.openedAt >= this.timeoutMs) {
        c.state = 'half_open';
        c.successes = 0;
      } else {
        return false;
      }
    }
    return true;
  }

  onSuccess(service: string): void {
    const c = this.get(service);
    if (c.state === 'half_open') {
      if (++c.successes >= this.successThreshold) {
        c.state = 'closed';
        c.failures = 0;
      }
    } else {
      c.failures = Math.max(0, c.failures - 1);
    }
  }

  onFailure(service: string): void {
    const c = this.get(service);
    c.failures++;
    c.lastFailureAt = Date.now();
    if (c.state === 'half_open' || c.failures >= this.failureThreshold) {
      c.state = 'open';
      c.openedAt = Date.now();
    }
  }

  getAll(): Record<string, Circuit> {
    return Object.fromEntries(this.circuits);
  }
}
