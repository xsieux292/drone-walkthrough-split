/**
 * Tiny inline markup for content strings: **bold** and `code`. No HTML is ever injected:
 * the template renders the segments as text inside <b> / <code>.
 *
 *   richText('ใช้ตามตัวอย่าง **ไม่ต้องแก้**')  →  [{text:'ใช้ตามตัวอย่าง '}, {text:'ไม่ต้องแก้', bold:true}]
 */
export interface RichSegment {
  text: string;
  bold?: boolean;
  code?: boolean;
}

export function richText(src: string): RichSegment[] {
  const out: RichSegment[] = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) });
    if (m[1] !== undefined) {
      // bold may itself contain `code`
      for (const seg of richText(m[1])) out.push({ ...seg, bold: true });
    } else {
      out.push({ text: m[2], code: true });
    }
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}
