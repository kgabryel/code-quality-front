export const OutputColor = {
  ERROR: '\x1b[31m',
  INFO: '\x1b[36m',
  WARNING: '\x1b[33m',
};

function prepareLines(lines, maxLength) {
  let parsed = [];
  let currentLine = '';

  for (const line of lines) {
    if (!line.trim() || line.length <= maxLength) {
      parsed.push(line);
      continue;
    }

    const words = line.split(' ');
    currentLine = '';
    for (const word of words) {
      const spacer = currentLine ? ' ' : '';
      if ((currentLine + spacer + word).length > maxLength) {
        if (currentLine) {
          parsed.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine += spacer + word;
      }
    }

    if (currentLine) {
      parsed.push(currentLine);
    }
  }

  return parsed;
}

export function messageBox({ content = [], footer = [], kind, source }, color = OutputColor.WARNING) {
  const terminalWidth = process.stdout?.columns || 80;
  const maxInnerWidth = Math.max(40, terminalWidth - 4);

  let header = `[${source}] | [${kind}]`;
  if (header.length > maxInnerWidth) {
    header = [source, kind];
  } else {
    header = [header];
  }

  header = prepareLines(header, maxInnerWidth);
  const preparedContent = prepareLines(content, maxInnerWidth);
  const preparedFooter = prepareLines(footer, maxInnerWidth);

  const width = Math.max(
    ...header.map((l) => l.length),
    ...preparedContent.map((l) => l.length),
    ...preparedFooter.map((l) => l.length),
  );
  const separator = '─'.repeat(width);

  const allLines = header;
  if (preparedContent.length > 0) {
    allLines.push(separator, ...preparedContent);
  }

  if (preparedFooter.length > 0) {
    allLines.push(separator, ...preparedFooter);
  }

  const top = `┌${'─'.repeat(width + 2)}┐`;
  const bottom = `└${'─'.repeat(width + 2)}┘`;
  const body = allLines.map((line) => `│ ${line.padEnd(width)} │`).join('\n');

  return `${color}${top}\n${body}\n${bottom}\x1b[0m`;
}
