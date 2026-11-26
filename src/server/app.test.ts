import { describe, expect } from 'vitest';
import { redis } from '@devvit/web/server';
import { createApp } from './app';
import { createModTest, expectAllEndpointsCovered } from './test-harness';

const test = createModTest({
  appFactory: createApp,
  settings: { botSignature: 'I am a bot.' },
});

describe('template app', () => {
  test('ignores normal posts', async ({ world, runner }) => {
    const post = await runner.userPosts('alice', { title: 'Normal physics discussion' });

    expect(world.isRemoved(post.id)).toBe(false);
    expect(world.actions).toEqual([]);
    expect(await redis.get(`app:post-handled:${post.id}`)).toBe('1');
  });

  test('removes and comments on [TEST-REMOVE] posts', async ({ runner }) => {
    await runner
      .scenario('[TEST-REMOVE] post')
      .when('alice posts a [TEST-REMOVE] post', ({ runner: r }) =>
        r.userPosts('alice', { id: 't3_remove1', title: '[TEST-REMOVE] Spam post' })
      )
      .then('the app comments, then removes it', ({ log }) => {
        expect(log).toEqual([
          'test-app comment t3_remove1 id=t1_c1 "Removed by template rule. --- ^I ^am ^a ^bot."',
          'test-app remove t3_remove1',
        ]);
      })
      .run();
  });

  test('does nothing when disabled', async ({ world, runner, configure }) => {
    configure({ enabled: false });
    await runner.userPosts('alice', { title: '[TEST-REMOVE] Spam post' });
    expect(world.actions).toEqual([]);
  });

  test('example moderator menu action', async ({ world, runner }) => {
    const post = world.seedPost({ id: 't3_menu1', title: 'x' });
    world.mod('modsy');
    const res = await runner
      .as('modsy')
      .menu('example-action', { targetId: post.id, location: 'post' });
    expect(res.showToast).toEqual({ text: 'Action ran on t3_menu1.', appearance: 'success' });
  });

  // Keep last: fails if a devvit.json trigger/menu/form/scheduler endpoint has no scenario above.
  test('every declared endpoint has a scenario', () => {
    expectAllEndpointsCovered();
  });
});
