import { ReactNode } from "react";

// Minimal, dependency-free Markdown renderer for article bodies. Supports the
// subset the articles use: ## / ### headings, paragraphs, - and 1. lists,
// > blockquotes, --- rules, and inline **bold**, *italic*, `code`, [links].
// No tables/images/HTML by design (articles are authored to this subset), which
// keeps the renderer tiny and safe — we never dangerouslySetInnerHTML, so
// nothing in the content string can inject markup. Typography lives in
// index.css under `.ct-article`.

const LINK_STYLE = { color: "var(--article-link)", textDecoration: "underline" };

function renderInline(text: string, kp: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))|(`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) nodes.push(<strong key={`${kp}-b${i}`}>{m[2]}</strong>);
    else if (m[3]) nodes.push(<em key={`${kp}-i${i}`}>{m[4]}</em>);
    else if (m[5]) {
      const href = m[7];
      // Only allow safe href schemes (defense-in-depth for a future where
      // article content is not fully first-party); anything else renders as
      // plain text, never a javascript:/data: link.
      const safe = /^(https?:\/\/|\/|#|mailto:)/i.test(href);
      if (safe) {
        const internal = href.startsWith("/") || href.startsWith("#");
        nodes.push(
          <a key={`${kp}-a${i}`} href={href} style={LINK_STYLE} {...(internal ? {} : { target: "_blank", rel: "noreferrer" })}>
            {m[6]}
          </a>
        );
      } else {
        nodes.push(m[6]);
      }
    } else if (m[8]) nodes.push(<code key={`${kp}-c${i}`}>{m[9]}</code>);
    last = re.lastIndex;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const BLOCK_START = /^(#{1,6}\s|>\s?|[-*]\s|\d+\.\s|(-{3,}|\*{3,}|_{3,})\s*$)/;

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const content = renderInline(h[2], `h${key}`);
      blocks.push(level <= 2 ? <h2 key={key++}>{content}</h2> : <h3 key={key++}>{content}</h3>);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }

    // Blockquote (consecutive > lines)
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push(<blockquote key={key}>{renderInline(quote.join(" "), `q${key++}`)}</blockquote>);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s/, "")); i++; }
      blocks.push(
        <ul key={key}>
          {items.map((it, ix) => (
            <li key={ix}>{renderInline(it, `ul${key}-${ix}`)}</li>
          ))}
        </ul>
      );
      key++;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++; }
      blocks.push(
        <ol key={key}>
          {items.map((it, ix) => (
            <li key={ix}>{renderInline(it, `ol${key}-${ix}`)}</li>
          ))}
        </ol>
      );
      key++;
      continue;
    }

    // Paragraph (until blank line or next block)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) { para.push(lines[i]); i++; }
    blocks.push(<p key={key}>{renderInline(para.join(" "), `p${key++}`)}</p>);
  }

  return <div className="ct-article">{blocks}</div>;
}

/**
 * Clip markdown to roughly `fraction` of its length at a paragraph boundary,
 * for the guest preview of premium articles. Cutting the SOURCE (not hiding
 * with CSS) means the gated remainder never reaches the DOM.
 */
export function clipMarkdown(source: string, fraction = 0.3): string {
  const target = Math.floor(source.length * fraction);
  const cut = source.indexOf("\n\n", target);
  return cut === -1 ? source.slice(0, target) : source.slice(0, cut);
}
