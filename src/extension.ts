import { commands, QuickPickItem, window } from "vscode";
import type { ExtensionContext } from "vscode";
import { paramCase, pascalCase, constantCase, snakeCase, camelCase } from "change-case";

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
    label: "@snake_case"
  }
];

function transformQuery2RegExp(query: string, scope: string) {
  switch(scope) {
    case "@all":
      return [
        paramCase(query),
        camelCase(query),
        pascalCase(query),
        constantCase(query),
        snakeCase(query)
      ].reduce((pre, cur) => {
        pre += pre.indexOf(cur) === -1 ? `|${cur}` : "";
        return pre;
      }, "").substring(1);
    case "@kebab-case":
      return paramCase(query);
    case "@camelCase":
      return camelCase(query);
    case "@PascalCase":
      return pascalCase(query);
    case "@UPPER_SNAKE_CASE":
      return constantCase(query);
    case "@snake_case":
      return snakeCase(query);
  }
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('case-search.showSearchBox', async () => {

    const quickPick = window.createQuickPick();
    quickPick.items = quickPickItems;
    quickPick.placeholder = "please input camelCased query text , default scope is @all";
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
        commands.executeCommand("workbench.action.findInFiles", { query: transformQuery2RegExp(query, scope) || query, triggerSearch: true, isRegex: true, isCaseSensitive: true });
        quickPick.hide();
      }
    });

    quickPick.show();
    
  }));

}

export function deactivate() {}
