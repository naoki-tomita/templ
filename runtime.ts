type Doc = {
  tag: string;
  props: Record<string, string | number | boolean>;
  children: Doc[];
} | string;

export function createElement(doc: Doc | string): Node {
  if (typeof doc === "string") return document.createTextNode(doc);
  const el = document.createElement(doc.tag);
  Object.entries(doc.props).forEach(([k, v]) => {
    if (v === false) return;
    el.setAttribute(k, v.toString());
  });
  doc.children.forEach(child => {
    el.appendChild(createElement(child));
  });
  return el;
}

export function render(elements: Node[], root: HTMLElement) {
  elements.forEach(el => root.appendChild(el));
}
