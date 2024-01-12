import { readFile, writeFile, mkdtemp, cp, rmdir } from "fs/promises";
import { parse } from "html-to-ast";
import { build } from "esbuild";

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
  const template = process.argv[2].replace(".tpl", "");
  const text = await readFile(`${template}.tpl`, "utf-8");
  const ast = parse(text);
  const script = ast.find(it => it.name === "script")?.children?.map(it => it.content).join("\n") ?? "";
  let scriptRenamedConstant = script
    .replace(/let\s+([0-9a-zA-Z_]+)\s*=/g, `__MARK_FOR_CONSTANT__.$1 = `) // let variable
    .replace(/const\s+([0-9a-zA-Z_]+)\s*=/g, `__MARK_FOR_CONSTANT__.$1 = `) // const variable
    .replace(/function\s+([0-9a-zA-Z_]+)\s*\(/g, `__MARK_FOR_CONSTANT__.$1 = function(`) // functions
  const constants = scriptRenamedConstant.matchAll(/__MARK_FOR_CONSTANT__\.(.+) =/g);
  for (const [_, constant] of constants) {
    scriptRenamedConstant = scriptRenamedConstant
      .replace(new RegExp(`\s*${constant}[\s\.]*`, "g"), `__state__.${constant}`)
      .replace(/__MARK_FOR_CONSTANT__\./g, "")
  }
  const astExcludedScript = ast.filter(it => it.name !== "script");
  const compiledCode = `
import { createElement, render } from "./runtime.ts";

window.__state__ = {};
${scriptRenamedConstant.trim()}
const elements = [${astExcludedScript.map(render).map(it => JSON.stringify(it)).join(", ")}];
render(elements, document.body);
  `.trim();

  const dir = await mkdtemp("tmp");
  try {
    await writeFile(`${dir}/index.ts`, compiledCode);
    await cp("runtime.ts", `${dir}/runtime.ts`);
    await build({
      entryPoints: [`${dir}/index.ts`],
      bundle: true,
      outfile: `${template}.js`,
    });
  } finally {
    await rmdir(dir, { recursive: true });
  }
}

main();
