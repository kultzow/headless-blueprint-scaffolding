import opentype from 'opentype.js';

export async function getFontSizeToFit(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontPath: string
): Promise<number> {
  const font = await opentype.load(fontPath);

 // account for paragraphs
const pCount= text.split(/\r\n|\r|\n|\\n/);
const pOffset = pCount.length * 15 - 15;

 text = text.replaceAll('{','');
 text = text.replaceAll('}',' ');

  let low = 20;
  let high = 42;
  let bestSize = low;

  while (low <= high) {
    const mid = Math.round((low + high) / 2 * 4) / 4;
    const lines = breakIntoLines(font, text, mid, maxWidth);
    const totalHeight = pOffset + measureTotalHeight(font, mid, lines.length);
    const maxLineWidth = Math.max(...lines.map(line => measureTextWidth(font, line, mid)));
    if (maxLineWidth <= maxWidth && totalHeight <= maxHeight) {
      bestSize = mid;
      low = mid + 0.25;
    } else {
      high = mid - 0.25;
    }
  }

  return bestSize;
}

function breakIntoLines(font: ReturnType<typeof opentype.loadSync>, text: string, fontSize: number, maxWidth: number): string[] {
  const paragraphs = text.split(/\r\n|\r|\n|\\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureTextWidth(font, testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
  }

  return lines;
}

function measureTotalHeight(font:ReturnType<typeof opentype.loadSync>, fontSize: number, lineCount: number, lineSpacing = 1): number {
  //const scale = fontSize / font.unitsPerEm;
  //const lineHeight = (font.ascender - font.descender) * scale * lineSpacing;
 const scale = fontSize / 2048;
  const lineHeight = (2146 + 555) * scale * lineSpacing;
    return lineHeight * lineCount;
}

function measureTextWidth(font: ReturnType<typeof opentype.loadSync>, text: string, fontSize: number): number {
  //const scale = fontSize / font.unitsPerEm;
    const scale = fontSize / 2048;
  let width = 0;
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    
    width += (glyph.advanceWidth ?? 0) * scale;
  }
  return width;
}
