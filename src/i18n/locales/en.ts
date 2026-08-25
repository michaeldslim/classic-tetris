export type TranslationSchema = {
  app: {
    title: string;
  };
  home: {
    startGame: string;
    highScore: string;
  };
  settings: {
    title: string;
    language: string;
    sound: string;
    bgmTrack: string;
    bgmVolume: string;
    sfxVolume: string;
    back: string;
    avatars: string;
    playerAvatar: string;
    playerAvatarDescription: string;
    career: string;
    score: string;
  };
  language: {
    ko: string;
    en: string;
  };
  bgm: {
    bgm1: string;
    bgm2: string;
    bgm3: string;
    bgm4: string;
  };
  hud: {
    score: string;
    level: string;
    stage: string;
    line: string;
    next: string;
  };
  profile: {
    score: string;
    level: string;
    stage: string;
    line: string;
    highScore: string;
    newBest: string;
  };
  tutorial: {
    move: string;
    rotate: string;
    softDrop: string;
    hardDrop: string;
  };
  overlay: {
    paused: string;
    gameOver: string;
    stageClear: string;
    youWin: string;
    resume: string;
    restart: string;
    next: string;
    playAgain: string;
    score: string;
    highScore: string;
    newHighScore: string;
    stageInfo: string;
    careerNextChapter: string;
    pauseHint: string;
  };
  accessibility: {
    settings: string;
    pause: string;
    resume: string;
  };
  career: {
    rank: {
      intern: string;
      staff: string;
      assistant: string;
      manager: string;
      deputy: string;
      director: string;
      executive: string;
      ceo: string;
    };
    promoted: {
      title: string;
      subtitle: string;
    };
    ceoReached: {
      title: string;
      subtitle: string;
    };
    progressNext: string;
    nextStage: string;
    lossKeepsProgress: string;
    noProgressLevel: string;
    homeBadge: string;
    maxRank: string;
    modeLabel: string;
    modeDesc: string;
    rulesSnippet: string;
    campaignLevel: string;
    screen: {
      title: string;
      currentRank: string;
      highestRank: string;
      ladderTitle: string;
      disabledTitle: string;
      disabledBody: string;
      enableInSettings: string;
    };
    ladder: {
      achieved: string;
      current: string;
      locked: string;
      startingRank: string;
      requirement: string;
      requirementLevel: string;
      progressToNext: string;
      stagePath: string;
    };
    reset: {
      currentProgress: string;
      label: string;
      description: string;
      button: string;
      confirmTitle: string;
      confirmMessage: string;
      confirm: string;
      cancel: string;
    };
  };
  score: {
    highScore: string;
    achievementsTitle: string;
    achievementUnlocked: string;
    achievement: {
      'score-1k': { title: string; description: string };
      'score-5k': { title: string; description: string };
      'score-10k': { title: string; description: string };
      'score-25k': { title: string; description: string };
      'score-50k': { title: string; description: string };
    };
  };
};

export const en: TranslationSchema = {
  app: {
    title: 'TETRIS',
  },
  home: {
    startGame: 'START GAME',
    highScore: 'Best {{score}}',
  },
  settings: {
    title: 'SETTINGS',
    language: 'Language',
    sound: 'Sound',
    bgmTrack: 'BGM',
    bgmVolume: 'BGM Volume',
    sfxVolume: 'SFX Volume',
    back: 'BACK',
    avatars: 'Avatars',
    playerAvatar: 'Player avatar',
    playerAvatarDescription: 'Shown during play and promotion celebrations.',
    career: 'Career',
    score: 'Score',
  },
  language: {
    ko: '한국어',
    en: 'English',
  },
  bgm: {
    bgm1: 'BGM 1',
    bgm2: 'BGM 2',
    bgm3: 'BGM 3',
    bgm4: 'BGM 4',
  },
  hud: {
    score: 'SCORE',
    level: 'LVL',
    stage: 'STG',
    line: 'LINE',
    next: 'NEXT',
  },
  profile: {
    score: 'Score',
    level: 'Lvl',
    stage: 'Stg',
    line: 'Lines',
    highScore: 'Best',
    newBest: 'NEW BEST',
  },
  tutorial: {
    move: 'Move left & right',
    rotate: 'Rotate piece',
    softDrop: 'Hold ↓',
    hardDrop: 'Swipe ↓',
  },
  overlay: {
    paused: 'PAUSED',
    gameOver: 'GAME OVER',
    stageClear: 'STAGE CLEAR',
    youWin: 'YOU WIN',
    resume: 'RESUME',
    restart: 'RESTART',
    next: 'NEXT',
    playAgain: 'PLAY AGAIN',
    score: 'Score: {{score}}',
    highScore: 'Best: {{score}}',
    newHighScore: 'NEW RECORD!',
    stageInfo: 'Level {{level}} · Stage {{stage}}',
    careerNextChapter: 'Next: {{rank}} · Level {{level}} · Stage {{stage}}',
    pauseHint: 'Tap RESUME or press P / Esc',
  },
  accessibility: {
    settings: 'Open settings',
    pause: 'Pause game',
    resume: 'Resume game',
  },
  career: {
    rank: {
      intern: 'Intern',
      staff: 'Staff',
      assistant: 'Assistant',
      manager: 'Manager',
      deputy: 'Deputy Director',
      director: 'Director',
      executive: 'Executive',
      ceo: 'CEO',
    },
    promoted: {
      title: 'Promoted!',
      subtitle: 'You are now {{rank}}',
    },
    ceoReached: {
      title: 'Congratulations!',
      subtitle: 'You reached CEO',
    },
    progressNext: 'Next: {{nextRank}} ({{required}} clears)',
    nextStage: 'Next: Level {{level}} · Stage {{stage}}',
    lossKeepsProgress: '{{rank}} · {{current}}/{{required}} clears — still on track',
    noProgressLevel: 'No promotion credit — need Level {{minLevel}}+',
    homeBadge: '{{rank}} · {{current}}/{{required}}',
    maxRank: '{{rank}} · top rank',
    modeLabel: 'Career mode',
    modeDesc: 'Climb ranks by clearing stages',
    rulesSnippet:
      'Start as an Intern and clear stages in order at each rank’s campaign level. You do not need to clear them in one run — game overs keep your progress. After a promotion, the next rank starts at its level · stage 1.',
    campaignLevel: 'Level {{level}}',
    screen: {
      title: 'Career progress',
      currentRank: 'Current rank',
      highestRank: 'Highest achieved',
      ladderTitle: 'Rank ladder',
      disabledTitle: 'Career mode is off',
      disabledBody: 'Turn on Career mode in Settings to track your rank and promotion progress.',
      enableInSettings: 'Open settings',
    },
    ladder: {
      achieved: 'Achieved',
      current: 'Current',
      locked: 'Locked',
      startingRank: 'Starting rank',
      requirement: 'Promotion: {{wins}} clears',
      requirementLevel: 'Promotion: Level {{minLevel}}+ · {{wins}} clears',
      progressToNext: '{{current}}/{{required}} clears → {{nextRank}}',
      stagePath: 'Path: {{path}}',
    },
    reset: {
      currentProgress: 'Current progress',
      label: 'Reset career progress',
      description: 'Clears your rank and clear count. Starts over as an Intern.',
      button: 'Reset to Intern',
      confirmTitle: 'Reset career progress?',
      confirmMessage: 'Your rank and clear count will be reset to Intern (0 clears).',
      confirm: 'Reset',
      cancel: 'Cancel',
    },
  },
  score: {
    highScore: 'High score',
    achievementsTitle: 'Score badges',
    achievementUnlocked: 'BADGE UNLOCKED',
    achievement: {
      'score-1k': {
        title: 'Rising star',
        description: 'Reach 1,000 points in one run',
      },
      'score-5k': {
        title: 'Solid stacker',
        description: 'Reach 5,000 points in one run',
      },
      'score-10k': {
        title: 'Line master',
        description: 'Reach 10,000 points in one run',
      },
      'score-25k': {
        title: 'Combo crafter',
        description: 'Reach 25,000 points in one run',
      },
      'score-50k': {
        title: 'Tetris legend',
        description: 'Reach 50,000 points in one run',
      },
    },
  },
} as const satisfies TranslationSchema;

export type TranslationKeys = typeof en;
