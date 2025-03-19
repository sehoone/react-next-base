import { atom } from 'jotai';

export const counterAtom = atom(0);
counterAtom.debugLabel = 'counterAtom'; // Optional label for debugging. jotai-devtools에서 label로 표시