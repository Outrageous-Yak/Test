/**
 * Accumulates active-race elapsed time with pause support.
 */
export class RaceTimer {
  private elapsedMs = 0;
  private running = false;

  reset(): void {
    this.elapsedMs = 0;
    this.running = false;
  }

  start(): void {
    this.running = true;
  }

  pause(): void {
    this.running = false;
  }

  resume(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  update(deltaMs: number): void {
    if (!this.running) return;
    this.elapsedMs += deltaMs;
  }

  getElapsedMs(): number {
    return this.elapsedMs;
  }

  isRunning(): boolean {
    return this.running;
  }
}
