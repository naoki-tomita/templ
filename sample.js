(() => {
  // runtime.ts
  function createElement(doc) {
    if (typeof doc === "string")
      return document.createTextNode(doc);
    const el = document.createElement(doc.tag);
    Object.entries(doc.props).forEach(([k, v]) => {
      if (v === false)
        return;
      el.setAttribute(k, v.toString());
    });
    doc.children.forEach((child) => {
      el.appendChild(createElement(child));
    });
    return el;
  }
  function render(elements2, root) {
    elements2.forEach((el) => root.appendChild(el));
  }

  // sample.ts
  var elements = [createElement({ "tag": "div", "props": {}, "children": ["\n  ", { "tag": "div", "props": {}, "children": ["{{ count }}"] }, " ", { "tag": "button", "props": { "onclick": "{{ increment }}" }, "children": ["increment"] }, " "] }), createElement(" "), createElement({ "tag": "script", "props": {}, "children": ["\nlet count = 0;\nfunction increment() {\n  count++;\n}\n"] })];
  render(elements, document.body);
})();
