import { describe, expect, it } from 'vitest';
import {
  calcMultiplierOnComplete,
  isHabitDueOnDate,
  normalizeMultiplierToHabitMax,
} from '../gameLogic.js';

function makeHabit(overrides = {}) {
  return {
    id: 'habit-1',
    name: 'Habito Test',
    multiplier: 1.0,
    maxMultiplier: 3.0,
    periodicity: 'daily',
    createdAt: '2026-04-01T12:00:00.000Z',
    customDays: '',
    customInterval: '',
    weeklyTimesTarget: null,
    ...overrides,
  };
}

describe('normalizeMultiplierToHabitMax', () => {
  it('reduce 0.4 por unidad en diaria', () => {
    const habit = makeHabit({ multiplier: 3.8, maxMultiplier: 3.0 });
    expect(normalizeMultiplierToHabitMax(habit, 1)).toBe(3.4);
  });

  it('aplica clamp al maxMultiplier y no baja de ese valor', () => {
    const habit = makeHabit({ multiplier: 3.8, maxMultiplier: 3.0 });
    expect(normalizeMultiplierToHabitMax(habit, 2)).toBe(3.0);
    expect(normalizeMultiplierToHabitMax(habit, 10)).toBe(3.0);
  });

  it('no cambia cuando multiplier === maxMultiplier', () => {
    const habit = makeHabit({ multiplier: 3.0, maxMultiplier: 3.0 });
    expect(normalizeMultiplierToHabitMax(habit, 1)).toBe(3.0);
  });

  it('no cambia cuando multiplier < maxMultiplier', () => {
    const habit = makeHabit({ multiplier: 2.7, maxMultiplier: 3.0 });
    expect(normalizeMultiplierToHabitMax(habit, 1)).toBe(2.7);
  });

  it('no cambia con unidades <= 0', () => {
    const habit = makeHabit({ multiplier: 3.6, maxMultiplier: 3.0 });
    expect(normalizeMultiplierToHabitMax(habit, 0)).toBe(3.6);
    expect(normalizeMultiplierToHabitMax(habit, -2)).toBe(3.6);
  });

  it.each([
    ['daily', 1],
    ['weekly', 1],
    ['monthly', 1],
  ])('aplica la misma regla base para periodicidad %s con units=%d', (periodicity, units) => {
    const habit = makeHabit({ periodicity, multiplier: 3.4, maxMultiplier: 3.0 });
    expect(normalizeMultiplierToHabitMax(habit, units)).toBe(3.0);
  });

  it('en weekly_times usa units = weeklyTimesTarget (ej: 5 => resta 2.0)', () => {
    const habit = makeHabit({ periodicity: 'weekly_times', multiplier: 5.0, maxMultiplier: 3.0, weeklyTimesTarget: 5 });
    expect(normalizeMultiplierToHabitMax(habit, habit.weeklyTimesTarget)).toBe(3.0);
  });
});

describe('calcMultiplierOnComplete - salvaguarda de incremento', () => {
  it('no incrementa si multiplier == maxMultiplier', () => {
    const habit = makeHabit({ multiplier: 3.0, maxMultiplier: 3.0 });
    expect(calcMultiplierOnComplete(habit, [])).toBe(3.0);
  });

  it('no incrementa si multiplier > maxMultiplier', () => {
    const habit = makeHabit({ multiplier: 3.6, maxMultiplier: 3.0 });
    expect(calcMultiplierOnComplete(habit, [])).toBe(3.6);
  });

  it('incrementa normalmente cuando está por debajo del tope', () => {
    const habit = makeHabit({ multiplier: 2.8, maxMultiplier: 3.0 });
    expect(calcMultiplierOnComplete(habit, [])).toBe(3.0);
  });

  it('respeta tope dinámico y no incrementa si ya está en ese tope', () => {
    const habit = makeHabit({ multiplier: 5.0, maxMultiplier: 3.0 });
    const effects = [{ key: 'dynamic_mult_cap', targetHabitId: habit.id, value: 5.0 }];
    expect(calcMultiplierOnComplete(habit, effects)).toBe(5.0);
  });

  it('sí incrementa hasta tope dinámico cuando está por debajo', () => {
    const habit = makeHabit({ multiplier: 4.8, maxMultiplier: 3.0 });
    const effects = [{ key: 'dynamic_mult_cap', targetHabitId: habit.id, value: 5.0 }];
    expect(calcMultiplierOnComplete(habit, effects)).toBe(5.0);
  });

  it('respeta tope de gema permanente (4.0)', () => {
    const habit = makeHabit({ multiplier: 4.0, maxMultiplier: 3.0 });
    const effects = [{ key: 'perm_base_mult', targetHabitId: habit.id }];
    expect(calcMultiplierOnComplete(habit, effects)).toBe(4.0);
  });

  it('con fusión activa mantiene el multiplicador sin incremento', () => {
    const habit = makeHabit({ multiplier: 6.2, maxMultiplier: 3.0 });
    const effects = [{ key: 'fusion_degradation', targetHabitId: habit.id }];
    expect(calcMultiplierOnComplete(habit, effects)).toBe(6.2);
  });
});

describe('isHabitDueOnDate - custom interval', () => {
  it('solo da due en fechas que cumplen el intervalo', () => {
    const habit = makeHabit({
      periodicity: 'custom',
      customInterval: '3',
      createdAt: '2026-04-01T09:00:00.000Z',
    });

    expect(isHabitDueOnDate(habit, '2026-04-01', {})).toBe(true);
    expect(isHabitDueOnDate(habit, '2026-04-02', {})).toBe(false);
    expect(isHabitDueOnDate(habit, '2026-04-03', {})).toBe(false);
    expect(isHabitDueOnDate(habit, '2026-04-04', {})).toBe(true);
    expect(isHabitDueOnDate(habit, '2026-04-07', {})).toBe(true);
  });
});
