import { readFile, writeFile } from "fs/promises";
import { parse } from "html-to-ast";

type MaybeDoc = ReturnType<typeof parse>[number];

function render(doc: MaybeDoc) {
  if (doc.type === "text") return doc.content!;
  return {
    tag: doc.name ?? "div",
    props: doc.attrs ?? {},
    children: (doc.children ?? []).map(render),
  }
}

async function main() {
  const text = await readFile("sample.tpl", "utf-8");
  const ast = parse(text);
  const compiledCode = `
import { createElement, render } from "./runtime.ts";
const elements = [${ast.map(render).map(it => `createElement(${JSON.stringify(it)})`).join(", ")}];
render(elements, document.body);
  `.trim();
  await writeFile("sample.ts", compiledCode);
}

main();
