export interface NumerologyResult {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthDay: number;
}

export function calculateLifePath(dob: string): number {
  // dob format: YYYY-MM-DD
  const digits = dob.replace(/-/g, '').split('').map(Number);
  return reduceNumber(digits.reduce((a, b) => a + b, 0));
}

export function calculateNameNumbers(name: string) {
  const chart: Record<string, number> = {
    a: 1, j: 1, s: 1,
    b: 2, k: 2, t: 2,
    c: 3, l: 3, u: 3,
    d: 4, m: 4, v: 4,
    e: 5, n: 5, w: 5,
    f: 6, o: 6, x: 6,
    g: 7, p: 7, y: 7,
    h: 8, q: 8, z: 8,
    i: 9, r: 9
  };

  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  let expressionSum = 0;
  let soulUrgeSum = 0;
  let personalitySum = 0;

  for (const char of cleanName) {
    const val = chart[char] || 0;
    expressionSum += val;
    if (vowels.includes(char)) {
      soulUrgeSum += val;
    } else {
      personalitySum += val;
    }
  }

  return {
    expression: reduceNumber(expressionSum),
    soulUrge: reduceNumber(soulUrgeSum),
    personality: reduceNumber(personalitySum)
  };
}

export function reduceNumber(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  if (num < 10) return num;
  const sum = String(num).split('').reduce((a, b) => a + Number(b), 0);
  return reduceNumber(sum);
}

export function getNumberMeaning(num: number): string {
  const meanings: Record<number, string> = {
    1: "The Leader: Independent, creative, and ambitious.",
    2: "The Peacemaker: Diplomatic, intuitive, and cooperative.",
    3: "The Communicator: Expressive, social, and imaginative.",
    4: "The Builder: Practical, disciplined, and steady.",
    5: "The Adventurer: Versatile, freedom-loving, and dynamic.",
    6: "The Nurturer: Responsible, loving, and harmonious.",
    7: "The Seeker: Analytical, spiritual, and introspective.",
    8: "The Powerhouse: Authoritative, successful, and material-minded.",
    9: "The Humanitarian: Compassionate, selfless, and idealistic.",
    11: "The Master Visionary: Intuitive, inspiring, and enlightened.",
    22: "The Master Builder: Practical, powerful, and manifestor.",
    33: "The Master Teacher: Altruistic, compassionate, and healing."
  };
  return meanings[num] || "A unique cosmic vibration.";
}
