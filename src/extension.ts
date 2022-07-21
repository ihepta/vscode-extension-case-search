import { commands, QuickPickItem, window } from "vscode";
import type { ExtensionContext } from "vscode";

const quickPickItems: QuickPickItem[] = [
  {
    label: "@all"
  },
  {
    label: "@kebab-case"
  },
  {
    label: "@camelCase"
  },
  {
    label: "@PascalCase"
  },
  {
    label: "@UPPER_SNAKE_CASE"
  },
  {
    label: "@underline"
  }
];

function transformQuery2RegExp(query: string, scope: string) {
  const arr = query.split(/\s+/);
  switch(scope) {
    case "@all":
      return [
        arr.map(s => s.toLowerCase()).join("-"),
        arr.map((s, i) => i === 0 ? s.toLowerCase() : s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(""),
        arr.map(s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(""),
        arr.map(s => s.toUpperCase()).join("_"),
        arr.map(s => s.toLowerCase()).join("_")
      ].reduce((pre, cur) => {
        pre += pre.indexOf(cur) === -1 ? `|${cur}` : "";
        return pre;
      }, "").substring(1);
    case "@kebab-case":
      return arr.map(s => s.toLowerCase()).join("-");
    case "@camelCase":
      return arr.map((s, i) => i === 0 ? s.toLowerCase() : s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join("");
    case "@PascalCase":
      return arr.map(s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join("");
    case "@UPPER_SNAKE_CASE":
      return arr.map(s => s.toUpperCase()).join("_");
    case "@underline":
      return arr.map(s => s.toLowerCase()).join("_");
  }
}

export function activate(context: ExtensionContext) {

  context.subscriptions.push(commands.registerCommand('case-search.showSearchBox', async () => {

    const quickPick = window.createQuickPick();
    quickPick.items = quickPickItems;
    quickPick.placeholder = "space separated query text , default scope is @all";
    quickPick.onDidChangeSelection(e => {
      const item = e[0];
      if (item) {
        quickPick.value = item.label + ": ";
      }
    });
    quickPick.onDidAccept(() => {
      let scope = "";
      let query = "";
      const reg = /@[^\s]*:/;
      let regMatchResult = quickPick.value.match(reg);
      if (regMatchResult) {
        scope = regMatchResult[0].substring(0, regMatchResult[0].length - 1);
        query = quickPick.value.replace(reg, "").trim();
      } else {
        scope = "@all";
        query = quickPick.value.trim();
      }

      if (query) {
        commands.executeCommand("workbench.action.findInFiles", { query: transformQuery2RegExp(query, scope), triggerSearch: true, isRegex: true, isCaseSensitive: true });
        quickPick.hide();
      }
    });

    quickPick.show();
    
  }));

}

export function deactivate() {}
