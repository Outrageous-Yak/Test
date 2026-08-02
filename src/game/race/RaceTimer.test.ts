import { describe, it, expect } from 'vitest';
import { RaceTimer } from './RaceTimer';

describe('RaceTimer', () => {
  it('starts at zero and does not advance when not running', () => {
    const timer = new RaceTimer();
    timer.update(100);
    expect(timer.getElapsedMs()).toBe(0);
  });

  it('advances only while running', () => {
    const timer = new RaceTimer();
    timer.start();
    timer.update(250);
    timer.update(250);
    expect(timer.getElapsedMs()).toBe(500);
  });

  it('pauses without advancing', () => {
    const timer = new RaceTimer();
    timer.start();
    timer.update(1000);
    timer.pause();
    timer.update(500);
    expect(timer.getElapsedMs()).toBe(1000);
  });

  it('resumes from paused elapsed time', () => {
    const timer = new RaceTimer();
    timer.start();
    timer.update(800);
    timer.pause();
    timer.resume();
    timer.update(200);
    expect(timer.getElapsedMs()).toBe(1000);
  });

  it('stops permanently at finish', () => {
    const timer = new RaceTimer();
    timer.start();
    timer.update(3000);
    timer.stop();
    timer.update(1000);
    expect(timer.getElapsedMs()).toBe(3000);
  });

  it('resets fully on restart', () => {
    const timer = new RaceTimer();
    timer.start();
    timer.update(4000);
    timer.reset();
    expect(timer.getElapsedMs()).toBe(0);
    expect(timer.isRunning()).toBe(false);
  });
});
