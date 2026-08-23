type LockSoundPlayer = () => void;

let lockSoundPlayer: LockSoundPlayer | null = null;

export function registerLockSoundPlayer(player: LockSoundPlayer | null) {
  lockSoundPlayer = player;
}

export function playLockSound() {
  lockSoundPlayer?.();
}
