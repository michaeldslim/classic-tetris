import { createInitialState, reduce, tick } from '../src/game/engine';
import { LINE_CLEAR_DURATION_MS } from '../src/game/speed';

describe('engine line clear', () => {
  it('advances line clear animation via tick and completes', () => {
    let state = createInitialState();
    state = {
      ...state,
      active: null,
      lineClear: { rows: [14, 15], elapsed: 0 },
    };

    state = tick(state, LINE_CLEAR_DURATION_MS);

    expect(state.lineClear).toBeNull();
    expect(state.active).not.toBeNull();
  });

  it('ignores player input while lines are clearing', () => {
    let state = createInitialState();
    state = {
      ...state,
      active: null,
      lineClear: { rows: [15], elapsed: 0 },
    };

    const next = reduce(state, 'LEFT');

    expect(next).toBe(state);
  });

  it('spawns the next piece after the lock spawn delay', () => {
    let state = createInitialState();
    state = {
      ...state,
      active: null,
      pendingSpawn: true,
      spawnDelayMs: 40,
    };

    state = tick(state, 20);
    expect(state.active).toBeNull();
    expect(state.spawnDelayMs).toBe(20);

    state = tick(state, 25);
    expect(state.active).not.toBeNull();
    expect(state.pendingSpawn).toBe(false);
  });

  it('retries the current stage without resetting campaign progress', () => {
    let state = createInitialState();
    state = {
      ...state,
      level: 1,
      stage: 2,
      lines: 4,
      score: 3200,
      gameOver: true,
      active: null,
    };

    const next = reduce(state, { type: 'RETRY_STAGE' });

    expect(next.level).toBe(1);
    expect(next.stage).toBe(2);
    expect(next.lines).toBe(0);
    expect(next.score).toBe(3200);
    expect(next.gameOver).toBe(false);
    expect(next.active).not.toBeNull();
  });
});
