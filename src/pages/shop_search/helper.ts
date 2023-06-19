export function splitTargetText(word: string, target: string) {
  const index = word.indexOf(target)
  if (index > -1) {
    return [word.slice(0, index), target, word.slice(index + target.length)]
  } else {
    return [word]
  }
}
