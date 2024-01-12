type Doc = {
  tag: string;
  props: Record<string, string | number | boolean>;
  children: Doc[];
} | string;

declare const __state__: Record<string, any>;

function inject(text: string, object: Record<string, any>) {
  return Object
    .entries(object)
    // "foo{{ hoge }}bar" -> `foo${object["hoge"]}bar`
    .reduce((t, [k, v]) => t.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v.toString()), text);
}

export function createElement(doc: Doc | string): Node {
  if (typeof doc === "string") return document.createTextNode(inject(doc, __state__));
  const el = document.createElement(doc.tag);
  Object.entries(doc.props).forEach(([k, v]) => {
    if (v === false) return;
    const textValue = v.toString();
    if (k.startsWith("on")) {
      const code = Object
        .keys(__state__)
        .reduce((c, k) => c.replace(new RegExp(`\s*(${k})[\s\.]*`, "g"), "__state__.$1"), v.toString());
      el[k] = function() {
        new Function(code)();
        rerender();
      }
    } else {
      const val = inject(textValue, __state__);
      el.setAttribute(k, val);
    }
  });
  doc.children.forEach(child => {
    el.appendChild(createElement(child));
  });
  return el;
}

function rerender() {
  try { elements.forEach(it => root?.removeChild(it)) } catch (e) {}
  elements = vnodes.map(createElement);
  elements.forEach(it => root?.appendChild(it));
}

let root: HTMLElement;
let vnodes: any[] = [];
let elements: Node[] = [];
export function render(_vnodes: any[], _root: HTMLElement) {
  root = _root;
  vnodes = _vnodes;
  rerender();
}
