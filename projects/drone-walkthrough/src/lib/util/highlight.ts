/** Tiny Python / shell highlighter for the typing animation. Not a parser: good enough for short snippets. */

export type TokenKind = 'kw' | 'str' | 'com' | 'num' | 'fn' | 'cls' | 'op' | 'txt';

export interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'from', 'import', 'as', 'def', 'class', 'return', 'for', 'in', 'if', 'else', 'elif', 'self', 'None', 'True', 'False',
  'with', 'try', 'except', 'lambda', 'and', 'or', 'not', 'while', 'pass', 'yield',
]);

const RE = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_])/g;

export function tokenize(code: string): Token[] {
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  let prev = '';
  RE.lastIndex = 0;
  while ((m = RE.exec(code))) {
    const [text, com, str, num, word] = m;
    let kind: TokenKind = 'txt';
    if (com) kind = 'com';
    else if (str) kind = 'str';
    else if (num) kind = 'num';
    else if (word) {
      if (KEYWORDS.has(word)) kind = 'kw';
      else if (prev === 'def' || code[RE.lastIndex] === '(') kind = /^[A-Z]/.test(word) ? 'cls' : 'fn';
      else if (prev === 'class' || /^[A-Z][a-z]/.test(word)) kind = 'cls';
      prev = word;
    } else if (/[=+\-*/<>.,:()[\]]/.test(text)) kind = 'op';
    out.push({ kind, text });
  }
  return out;
}

/** The first `chars` characters of a token list, cutting the last token if needed. */
export function sliceTokens(tokens: Token[], chars: number): Token[] {
  const out: Token[] = [];
  let left = chars;
  for (const t of tokens) {
    if (left <= 0) break;
    if (t.text.length <= left) out.push(t);
    else out.push({ kind: t.kind, text: t.text.slice(0, left) });
    left -= t.text.length;
  }
  return out;
}
