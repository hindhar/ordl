// Calculate WCAG contrast ratio
function getLuminance(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function checkWCAG(ratio) {
  return {
    'AA Large': ratio >= 3.0,
    'AA Normal': ratio >= 4.5,
    'AAA Large': ratio >= 4.5,
    'AAA Normal': ratio >= 7.0,
  };
}

const colors = {
  bgPrimary: '#FAF9F6',
  bgSecondary: '#FFFFFF',
  textPrimary: '#1A1A19',
  textSecondary: '#6B6B66',
  textTertiary: '#9A9A94',
  accent: '#2D5A4A',
  correct: '#2D5A4A',
  incorrect: '#C4553D',
};

console.log('=== WCAG Contrast Ratio Analysis ===\n');

const tests = [
  ['Text Primary on BG Primary', colors.textPrimary, colors.bgPrimary],
  ['Text Secondary on BG Primary', colors.textSecondary, colors.bgPrimary],
  ['Text Tertiary on BG Primary', colors.textTertiary, colors.bgPrimary],
  ['White on Accent (buttons)', '#FFFFFF', colors.accent],
  ['White on Correct Green', '#FFFFFF', colors.correct],
  ['White on Incorrect Red', '#FFFFFF', colors.incorrect],
];

tests.forEach(([name, fg, bg]) => {
  const ratio = getContrastRatio(fg, bg);
  const results = checkWCAG(ratio);
  console.log(`${name}: ${ratio.toFixed(2)}:1`);
  Object.entries(results).forEach(([level, pass]) => {
    console.log(`  ${level}: ${pass ? '✅ Pass' : '❌ Fail'}`);
  });
  console.log('');
});
