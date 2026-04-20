// Local dictionary-based sentiment scoring. No data leaves the device.
// Scores range from -1 (very negative) to +1 (very positive).

const POSITIVE: Record<string, number> = {
  // English
  happy: 0.8, great: 0.8, wonderful: 0.9, amazing: 0.9, excellent: 0.8,
  good: 0.6, love: 0.8, loved: 0.8, lovely: 0.7, beautiful: 0.7,
  fantastic: 0.9, awesome: 0.8, joyful: 0.9, excited: 0.8, grateful: 0.9,
  thankful: 0.8, proud: 0.7, peaceful: 0.7, calm: 0.6, relaxed: 0.6,
  fun: 0.7, laugh: 0.7, laughed: 0.7, smile: 0.7, smiled: 0.7,
  enjoy: 0.7, enjoyed: 0.7, win: 0.7, won: 0.7, success: 0.8,
  perfect: 0.8, inspired: 0.8, energetic: 0.7, productive: 0.7, accomplished: 0.8,
  // Russian
  хорошо: 0.6, отлично: 0.8, прекрасно: 0.9, замечательно: 0.9,
  счастлив: 0.8, счастлива: 0.8, рад: 0.7, рада: 0.7, люблю: 0.8,
  радость: 0.8, весело: 0.7, спокойно: 0.6, благодарен: 0.9, благодарна: 0.9,
  горжусь: 0.7, успех: 0.8, победа: 0.8, замечательный: 0.9,
  улыбался: 0.7, улыбалась: 0.7, смеялся: 0.7, смеялась: 0.7,
  вдохновлён: 0.8, вдохновлена: 0.8, прекрасный: 0.8, красиво: 0.7,
};

const NEGATIVE: Record<string, number> = {
  // English
  sad: -0.7, terrible: -0.9, awful: -0.9, horrible: -0.8, bad: -0.6,
  angry: -0.7, frustrated: -0.7, stressed: -0.7, worried: -0.6, tired: -0.4,
  exhausted: -0.7, anxious: -0.7, sick: -0.6, pain: -0.6, hurt: -0.6,
  lonely: -0.7, bored: -0.5, disappointed: -0.7, failed: -0.7, lost: -0.5,
  hate: -0.8, difficult: -0.4, hard: -0.3, struggle: -0.5, crying: -0.7,
  cry: -0.7, miss: -0.4, missed: -0.4, problem: -0.4, issue: -0.3,
  // Russian
  плохо: -0.6, ужасно: -0.9, страшно: -0.7, грустно: -0.7, тяжело: -0.6,
  устал: -0.5, устала: -0.5, злой: -0.7, злая: -0.7, раздражён: -0.7,
  раздражена: -0.7, тревожно: -0.7, больно: -0.6, одиноко: -0.7,
  скучно: -0.5, разочарован: -0.7, разочарована: -0.7, сложно: -0.4,
  трудно: -0.4, беспокоюсь: -0.6, переживаю: -0.5,
  провалился: -0.7, провалилась: -0.7, потерял: -0.5, потеряла: -0.5,
};

const NEGATORS = new Set([
  'not', 'no', 'never', 'nor', "n't", 'without',
  'не', 'нет', 'никогда', 'без',
]);

export function scoreSentiment(text: string): number {
  const words = text.toLowerCase().match(/[а-яёa-z']+/g) ?? [];
  if (words.length === 0) return 0;

  let total = 0;
  let count = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const negated = i > 0 && NEGATORS.has(words[i - 1]);
    const posScore = POSITIVE[word];
    const negScore = NEGATIVE[word];

    if (posScore !== undefined) {
      total += negated ? -posScore * 0.5 : posScore;
      count++;
    } else if (negScore !== undefined) {
      total += negated ? -negScore * 0.5 : negScore;
      count++;
    }
  }

  return count > 0 ? Math.max(-1, Math.min(1, total / count)) : 0;
}
