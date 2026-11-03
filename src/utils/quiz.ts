/**
 * Utility to randomize and balance multiple choice options
 * Ensures correct answers are varied across A, B, C (not always A or B)
 */

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface BaseQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
  explanation?: string;
}

/**
 * Distributes the correct answer evenly across positions (A, B, C)
 * so that no single letter is perpetually the correct answer.
 * For example, across 5 questions:
 * - Soal 1 -> C
 * - Soal 2 -> B
 * - Soal 3 -> A
 * - Soal 4 -> C
 * - Soal 5 -> B
 */
export function getVariedOptions<T extends BaseQuizOption>(
  options: T[],
  questionIndex: number,
  seed = 0
): T[] {
  if (!options || options.length <= 1) return options;

  const correct = options.find((o) => o.isCorrect);
  const wrongs = options.filter((o) => !o.isCorrect);

  if (!correct) return shuffleArray(options);

  const shuffledWrongs = shuffleArray(wrongs);
  // Spread target index across 0 (A), 1 (B), 2 (C)
  const targetIndex = (questionIndex * 2 + seed + 2) % options.length;

  const result: T[] = [];
  let wrongIdx = 0;

  for (let i = 0; i < options.length; i++) {
    if (i === targetIndex) {
      result.push(correct);
    } else if (wrongIdx < shuffledWrongs.length) {
      result.push(shuffledWrongs[wrongIdx++]);
    } else {
      result.push(correct);
    }
  }

  return result;
}
