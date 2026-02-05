import markdownIt from 'markdown-it';

// Configure markdown-it
const md = new markdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Custom plugin to add IDs to headings
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const level = token.tag.slice(1);
  
  // Extract all text content from the inline tokens until heading_close
  let i = idx + 1;
  let title = '';
  while (tokens[i] && tokens[i].type !== 'heading_close') {
    if (tokens[i].type === 'inline') {
      title += tokens[i].content;
    }
    i++;
  }

  const id = title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  return `<h${level} id="${id}">`;
};

export function renderMarkdown(text) {
  if (!text) return '';
  return md.render(text);
}

export function extractTOC(markdown) {
  const lines = markdown.split('\n');
  const toc = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      toc.push({
        level,
        title,
        id,
        index
      });
    }
  });

  return toc;
}

export function searchInMarkdown(markdown, query) {
  if (!query) return null;

  const lines = markdown.split('\n');
  const results = [];

  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        line: index + 1,
        text: line.trim(),
        context: getLineContext(lines, index, 2)
      });
    }
  });

  return results;
}

function getLineContext(lines, index, contextLines) {
  const start = Math.max(0, index - contextLines);
  const end = Math.min(lines.length, index + contextLines + 1);
  return lines.slice(start, end).join('\n');
}

export function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
