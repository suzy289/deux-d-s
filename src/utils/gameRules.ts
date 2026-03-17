export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

/** Somme des deux dés (2-12) */
export function rollSum(die1: number, die2: number): number {
  return die1 + die2;
}

/** Règle du Million : double 1 (somme 2) gagne le tour quand la règle est activée */
export function isMillionWin(die1: number, die2: number, millionRuleEnabled: boolean): boolean {
  return millionRuleEnabled && die1 === 1 && die2 === 1;
}
