import type { ConditionId } from './types';

/** Fisher–Yates shuffle producing a randomized order containing T0/P1/P2/P3 exactly once. */
export function randomizedConditionOrder(): ConditionId[] {
  const arr: ConditionId[] = ['T0', 'P1', 'P2', 'P3'];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
