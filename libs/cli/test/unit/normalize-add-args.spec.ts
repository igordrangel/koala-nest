import { describe, expect, it } from 'bun:test';
import { normalizeAddArgs } from '@cli/utils/normalize-add-args.ts';

describe('normalizeAddArgs', () => {
  it('ordena cache antes de auth e health', () => {
    expect(
      normalizeAddArgs([
        { kind: 'auth', strategies: ['jwt'] },
        { kind: 'feature', feature: 'health-check' },
        { kind: 'feature', feature: 'cache' },
      ]),
    ).toEqual([
      { kind: 'feature', feature: 'cache' },
      { kind: 'auth', strategies: ['jwt'] },
      { kind: 'feature', feature: 'health-check' },
    ]);
  });

  it('coloca auth primeiro quando cache não está na lista', () => {
    expect(
      normalizeAddArgs([
        { kind: 'feature', feature: 'internal-cron-jobs' },
        { kind: 'auth', strategies: ['oauth2'] },
      ]),
    ).toEqual([
      { kind: 'auth', strategies: ['oauth2'] },
      { kind: 'feature', feature: 'internal-cron-jobs' },
    ]);
  });

  it('preserva ordem fixa entre features extras', () => {
    expect(
      normalizeAddArgs([
        { kind: 'feature', feature: 'internal-event-jobs' },
        { kind: 'feature', feature: 'cache' },
        { kind: 'feature', feature: 'internal-cron-jobs' },
        { kind: 'feature', feature: 'health-check' },
      ]),
    ).toEqual([
      { kind: 'feature', feature: 'cache' },
      { kind: 'feature', feature: 'health-check' },
      { kind: 'feature', feature: 'internal-cron-jobs' },
      { kind: 'feature', feature: 'internal-event-jobs' },
    ]);
  });
});
