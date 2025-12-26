export interface ShareData {
  puzzleNumber: number;
  attempts: boolean[][];
  won: boolean;
  streak: number;
  isSimulation?: boolean;
}

// Generate Wordle-style grid: each row = one guess, each column = one position
export const generateGridRows = (attempts: boolean[][]): string[] => {
  if (attempts.length === 0) return [];

  // Each row is one guess attempt, showing all 6 positions
  return attempts.map((attempt) =>
    attempt.map((correct) => (correct ? '🟩' : '🟥')).join('')
  );
};

// Generate the share text with emoji grid - optimized for virality
export const generateShareText = (data: ShareData): string => {
  const { puzzleNumber, attempts, won, streak, isSimulation } = data;

  // Score format like Wordle: attempts/max or X for loss
  const score = won ? `${attempts.length}/4` : 'X/4';

  // Build Wordle-style grid: each row = one guess
  const grid = generateGridRows(attempts).join('\n');

  // Streak prominently displayed for social proof (only for non-practice games)
  const streakLine = !isSimulation && streak > 1 ? `\n🔥 ${streak} day streak!` : '';

  // Practice mode indicator
  const puzzleLabel = isSimulation ? `Ordl Practice #${puzzleNumber}` : `Ordl #${puzzleNumber}`;

  return `${puzzleLabel} ${score}

${grid}${streakLine}

ordl.io`;
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Try modern API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch {
    console.error('Failed to copy to clipboard');
    return false;
  }
};
