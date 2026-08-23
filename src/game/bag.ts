import type { TetrominoType } from '../theme/colors';
import { tetrominoTypes } from './tetrominoes';

export function createShuffledBag(): TetrominoType[] {
  const bag = [...tetrominoTypes];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j]!, bag[i]!];
  }
  return bag;
}

export function drawFromBag(bag: TetrominoType[]): {
  piece: TetrominoType;
  bag: TetrominoType[];
} {
  let queue = bag;
  if (queue.length === 0) {
    queue = createShuffledBag();
  }

  const [piece, ...rest] = queue;
  return { piece: piece!, bag: rest };
}
