(() => {
  // tmpZ3zRPy/runtime.ts
  function inject(text, object) {
    return Object.entries(object).reduce((t, [k, v]) => t.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v.toString()), text);
  }
  function createElement(doc) {
    if (typeof doc === "string")
      return document.createTextNode(inject(doc, __state__));
    const el = document.createElement(doc.tag);
    Object.entries(doc.props).forEach(([k, v]) => {
      if (v === false)
        return;
      const textValue = v.toString();
      if (k.startsWith("on")) {
        const code = Object.keys(__state__).reduce((c, k2) => c.replace(new RegExp(`s*(${k2})[s.]*`, "g"), "__state__.$1"), v.toString());
        el[k] = function() {
          new Function(code)();
          rerender();
        };
      } else {
        const val = inject(textValue, __state__);
        el.setAttribute(k, val);
      }
    });
    doc.children.forEach((child) => {
      el.appendChild(createElement(child));
    });
    return el;
  }
  function rerender() {
    try {
      elements.forEach((it) => root?.removeChild(it));
    } catch (e) {
    }
    elements = vnodes.map(createElement);
    elements.forEach((it) => root?.appendChild(it));
  }
  var root;
  var vnodes = [];
  var elements = [];
  function render(_vnodes, _root) {
    root = _root;
    vnodes = _vnodes;
    rerender();
  }

  // tmpZ3zRPy/index.ts
  window.__state__ = {};
  __state__.count = 0;
  __state__.increment = function() {
    __state__.count++;
  };
  var elements2 = [{ "tag": "div", "props": {}, "children": ["\n  ", { "tag": "div", "props": {}, "children": ["{{ count }}"] }, " ", { "tag": "button", "props": { "onclick": "increment()" }, "children": ["increment"] }, " "] }, " "];
  render(elements2, document.body);
})();
