export type AvatarId =
  | 'female-1'
  | 'female-2'
  | 'female-3'
  | 'male-1'
  | 'male-2'
  | 'uncle-glasses'
  | 'auntie-warm'
  | 'grandma-gentle'
  | 'grandpa'
  | 'businessman';

export const AVATAR_IDS: AvatarId[] = [
  'female-1',
  'female-2',
  'female-3',
  'male-1',
  'male-2',
  'uncle-glasses',
  'auntie-warm',
  'grandma-gentle',
  'grandpa',
  'businessman',
];

export const DEFAULT_PLAYER_AVATAR_ID: AvatarId = 'female-1';

export const AVATAR_IMAGES: Record<AvatarId, number> = {
  'female-1': require('../../assets/avatars/avatar-female-1.png'),
  'female-2': require('../../assets/avatars/avatar-female-2.png'),
  'female-3': require('../../assets/avatars/avatar-female-3.png'),
  'male-1': require('../../assets/avatars/avatar-male-1.png'),
  'male-2': require('../../assets/avatars/avatar-male-2.png'),
  'uncle-glasses': require('../../assets/avatars/avatar-uncle-glasses.png'),
  'auntie-warm': require('../../assets/avatars/avatar-auntie-warm.png'),
  'grandma-gentle': require('../../assets/avatars/avatar-grandma-gentle.png'),
  grandpa: require('../../assets/avatars/avatar-grandpa.png'),
  businessman: require('../../assets/avatars/avatar-businessman.png'),
};

export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === 'string' && AVATAR_IDS.includes(value as AvatarId);
}

export function resolveAvatarId(value: unknown, fallback: AvatarId): AvatarId {
  return isAvatarId(value) ? value : fallback;
}
