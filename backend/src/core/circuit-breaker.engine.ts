export type CircuitState = 'closed' | 'open' | 'half_open';

export interface Circuit {
  state: CircuitState;
  failures: number;
  successes: number;
  openedAt: number;
  lastFailureAt: number;
}

/**
 * Circuit Breaker Engine
 * ระบบป้องกันการเรียกใช้งาน Service/Job ที่พังซ้ำๆ (เหมือนเบรกเกอร์ไฟฟ้า)
 * ช่วยลดโหลดและให้เวลาปลายทางในการฟื้นตัว
 */
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

  /**
   * ตรวจสอบว่าสามารถเรียกใช้งาน Service นี้ได้หรือไม่
   */
  canExecute(service: string): boolean {
    const c = this.get(service);
    // หากเบรกเกอร์ปกติ (Closed) สามารถเรียกใช้งานได้ทันที
    if (c.state === 'closed') return true;

    // หากเบรกเกอร์ตัดการทำงาน (Open)
    if (c.state === 'open') {
      // ตรวจสอบว่าพ้นระยะเวลา Cool down หรือยัง ถ้าพ้นแล้วให้ทดลองปล่อยผ่าน (Half-Open)
      if (Date.now() - c.openedAt >= this.timeoutMs) {
        c.state = 'half_open';
        c.successes = 0;
      } else {
        return false;
      }
    }
    return true;
  }

  /**
   * บันทึกผลเมื่อทำงานสำเร็จ
   */
  onSuccess(service: string): void {
    const c = this.get(service);
    // ถ้าระบบกำลังทดลองปล่อยผ่าน (Half-Open) และเริ่มทำงานสำเร็จครบตามเป้าหมาย ให้สับสวิตช์กลับเป็นปกติ (Closed)
    if (c.state === 'half_open') {
      if (++c.successes >= this.successThreshold) {
        c.state = 'closed';
        c.failures = 0;
      }
    } else {
      c.failures = Math.max(0, c.failures - 1);
    }
  }

  /**
   * บันทึกผลเมื่อทำงานล้มเหลว
   */
  onFailure(service: string): void {
    const c = this.get(service);
    c.failures++;
    c.lastFailureAt = Date.now();

    // ถ้าพังระหว่างทดลองปล่อย (Half-Open) หรือพังต่อเนื่องจนเกินขีดจำกัด ให้สับคัตเอาต์ตัดระบบ (Open)
    if (c.state === 'half_open' || c.failures >= this.failureThreshold) {
      c.state = 'open';
      c.openedAt = Date.now();
    }
  }

  getAll(): Record<string, Circuit> {
    return Object.fromEntries(this.circuits);
  }
}
