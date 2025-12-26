export interface ShareData {
  puzzleNumber: number;
  attempts: boolean[][];
  won: boolean;
  streak: number;
  isSimulation?: boolean;
}

// Generate grid: each row = one position (6 rows), each column = one guess attempt
export const generateGridRows = (attempts: boolean[][]): string[] => {
  if (attempts.length === 0) return [];

  const numPositions = 6;
  const rows: string[] = [];

  // For each position (0-5), create a row showing that position across all guesses
  for (let pos = 0; pos < numPositions; pos++) {
    const row = attempts
      .map((attempt) => (attempt[pos] ? '🟩' : '🟥'))
      .join('');
    rows.push(row);
  }

  return rows;
};

// Generate the share text with emoji grid - clean and simple
export const generateShareText = (data: ShareData): string => {
  const { puzzleNumber, attempts, isSimulation } = data;

  // Build grid: 6 rows (positions) x up to 4 columns (guesses)
  const grid = generateGridRows(attempts).join('\n');

  // Puzzle label
  const puzzleLabel = isSimulation ? `Ordl Practice #${puzzleNumber}` : `Ordl #${puzzleNumber}`;

  return `${puzzleLabel}

${grid}

Play Ordl at ordl.io`;
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

// Share using native share sheet (mobile) or fallback to clipboard
export const shareResults = async (data: ShareData): Promise<{ success: boolean; method: 'native' | 'clipboard' }> => {
  const shareText = generateShareText(data);

  // Try native share API first (primarily for mobile)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // Only pass text - URL is already in the text, avoids duplication in WhatsApp etc.
      await navigator.share({
        text: shareText,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      // User cancelled or share failed - fall through to clipboard
      if ((err as Error).name !== 'AbortError') {
        console.error('Native share failed:', err);
      }
    }
  }

  // Fallback to clipboard
  const clipboardSuccess = await copyToClipboard(shareText);
  return { success: clipboardSuccess, method: 'clipboard' };
};
