import {
  addLeaderboardEntry,
  isValidInitials,
  MAX_LEADERBOARD_ENTRIES,
  normalizeInitials,
  parseLeaderboardState,
  sortLeaderboardEntries,
} from '../src/leaderboard/leaderboardProgress';

describe('leaderboard progress', () => {
  it('normalizes initials to uppercase letters only', () => {
    expect(normalizeInitials('ab1')).toBe('AB');
    expect(normalizeInitials('xyz')).toBe('XYZ');
    expect(isValidInitials('XYZ')).toBe(true);
    expect(isValidInitials('XY')).toBe(false);
  });

  it('sorts entries by score descending', () => {
    const sorted = sortLeaderboardEntries([
      {
        id: '1',
        initials: 'AAA',
        avatarId: 'female-1',
        rank: 'chairman',
        score: 1000,
        clearedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: '2',
        initials: 'BBB',
        avatarId: 'male-1',
        rank: 'chairman',
        score: 5000,
        clearedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(sorted[0]?.initials).toBe('BBB');
    expect(sorted[1]?.initials).toBe('AAA');
  });

  it('stores avatar id with new entries', () => {
    const entries = addLeaderboardEntry([], {
      initials: 'ABC',
      score: 9000,
      avatarId: 'grandpa',
    });

    expect(entries[0]?.avatarId).toBe('grandpa');
  });

  it('caps stored entries at the leaderboard limit', () => {
    let entries = [] as ReturnType<typeof addLeaderboardEntry>;
    for (let index = 0; index < MAX_LEADERBOARD_ENTRIES + 5; index += 1) {
      entries = addLeaderboardEntry(entries, {
        initials: 'ABC',
        score: index,
        avatarId: 'female-1',
      });
    }

    expect(entries).toHaveLength(MAX_LEADERBOARD_ENTRIES);
    expect(entries[0]?.score).toBe(MAX_LEADERBOARD_ENTRIES + 4);
  });

  it('parses persisted leaderboard state safely', () => {
    const parsed = parseLeaderboardState(
      JSON.stringify({
        entries: [
          {
            id: 'ok',
            initials: 'ml1',
            rank: 'chairman',
            score: 12000,
            clearedAt: '2026-08-30T00:00:00.000Z',
          },
          {
            id: 'with-avatar',
            initials: 'XYZ',
            avatarId: 'businessman',
            rank: 'chairman',
            score: 50000,
            clearedAt: '2026-08-29T00:00:00.000Z',
          },
          { id: 'bad', initials: 'XX', rank: 'staff', score: -1 },
        ],
      }),
    );

    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0]?.initials).toBe('XYZ');
    expect(parsed.entries[0]?.avatarId).toBe('businessman');
    expect(parsed.entries[1]?.initials).toBe('MLA');
    expect(parsed.entries[1]?.avatarId).toBe('female-1');
  });
});
