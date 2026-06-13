import { describe, expect, it } from 'bun:test';
import {
  buildProjectExpectation,
  CLI_NEW_SELECTION_MATRIX,
  forbiddenPathsForExpectation,
  requiredPathsForExpectation,
} from '@cli/constants/cli-project-checklist';
import { AuthStrategy, ExtraFeature, Template } from '@cli/constants/domain';

describe('cli-project-checklist', () => {
  it('buildProjectExpectation reflete resolveNewProjectOptions no CRUD', () => {
    expect(
      buildProjectExpectation(Template.CRUD_SAMPLE, [], []),
    ).toEqual({
      template: Template.CRUD_SAMPLE,
      auth: [AuthStrategy.JWT],
      cache: 'redis',
      health: false,
      cronJobs: true,
      eventJobs: true,
    });
  });

  it('buildProjectExpectation preserva auth escolhida no CRUD', () => {
    expect(
      buildProjectExpectation(Template.CRUD_SAMPLE, [AuthStrategy.OAUTH2], []),
    ).toMatchObject({
      auth: [AuthStrategy.OAUTH2],
      cache: 'redis',
      cronJobs: true,
      eventJobs: true,
    });
  });

  it('buildProjectExpectation usa cache em memória para auth sem Redis', () => {
    expect(
      buildProjectExpectation(Template.DEFAULT, [AuthStrategy.JWT], []),
    ).toMatchObject({
      cache: 'memory',
      health: false,
      cronJobs: false,
      eventJobs: false,
    });
  });

  it('buildProjectExpectation inclui cron com cache implícito em memória', () => {
    expect(
      buildProjectExpectation(Template.DEFAULT, [], [
        ExtraFeature.INTERNAL_CRON_JOBS,
      ]),
    ).toMatchObject({
      cache: 'memory',
      cronJobs: true,
    });
  });

  it('matriz new cobre default e crud com todas as estratégias de auth', () => {
    const labels = CLI_NEW_SELECTION_MATRIX.map((item) => item.label);

    expect(labels).toContain('default sem auth');
    expect(labels).toContain('default jwt');
    expect(labels).toContain('default oauth2');
    expect(labels).toContain('default jwt + oauth2');
    expect(labels).toContain('crud jwt');
    expect(labels).toContain('crud oauth2');
    expect(labels).toContain('crud jwt + oauth2');
  });

  it('matriz new cobre features opcionais isoladas e combinadas', () => {
    const labels = CLI_NEW_SELECTION_MATRIX.map((item) => item.label);

    expect(labels).toContain('default sem auth + health');
    expect(labels).toContain('default sem auth + cache');
    expect(labels).toContain('default sem auth + cron');
    expect(labels).toContain('default sem auth + events');
    expect(labels).toContain('default sem auth + cache + health + cron + events');
    expect(labels).toContain('default jwt + cache + health');
  });

  it('paths obrigatórios e proibidos não se sobrepõem por perfil', () => {
    for (const selection of CLI_NEW_SELECTION_MATRIX) {
      const expectation = buildProjectExpectation(
        selection.template,
        selection.auth,
        selection.features,
      );
      const required = new Set(requiredPathsForExpectation(expectation));
      const forbidden = forbiddenPathsForExpectation(expectation);
      const overlap = forbidden.filter((item) => required.has(item));

      expect(overlap).toEqual([]);
    }
  });

  it('default sem features proíbe artefatos de cache, health, cron e events', () => {
    const expectation = buildProjectExpectation(Template.DEFAULT, [], []);

    expect(forbiddenPathsForExpectation(expectation)).toEqual(
      expect.arrayContaining([
        'src/infra/common/redis-cache.service.ts',
        'src/host/controllers/health-check/health-check.controller.ts',
        'src/core/utils/cron-expression-to-boolean.ts',
        'src/core/background-services/event-service/event-handler.base.ts',
      ]),
    );
  });

  it('crud bundled exige person, cache redis, cron e events', () => {
    const expectation = buildProjectExpectation(
      Template.CRUD_SAMPLE,
      [AuthStrategy.JWT],
      [],
    );

    expect(requiredPathsForExpectation(expectation)).toEqual(
      expect.arrayContaining([
        'src/host/controllers/person/person.module.ts',
        'src/infra/common/redis-cache.service.ts',
        'src/core/utils/cron-expression-to-boolean.ts',
        'src/core/background-services/event-service/event-handler.base.ts',
      ]),
    );
  });
});
