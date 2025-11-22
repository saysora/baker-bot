//export const spaceChar = 'ㅤ';
export const spaceChar = '⠀';

export function addSpaces(ref: string, current: string, additional = 0) {
  const refSize = [...ref].length;
  const currentSize = [...current].length;

  let diff = refSize - currentSize;

  if (diff < 0) {
    diff = 0;
  }

  return `${current}${spaceChar.repeat(diff + additional)}`;
}
