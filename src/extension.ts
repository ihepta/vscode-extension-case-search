import { commands, QuickPickItem, window } from "vscode";
import type { ExtensionContext } from "vscode";
import { paramCase, camelCase, pascalCase, snakeCase, constantCase, capitalCase, pathCase } from "change-case";


const kebabCaseQPI:       QuickPickItem = { label: "kebab-case",        alwaysShow: true, };
const camelCaseQPI:       QuickPickItem = { label: "camelCase",         alwaysShow: true, };
const pascalCaseQPI:      QuickPickItem = { label: "PascalCase",        alwaysShow: true, };
const snakeCaseQPI:       QuickPickItem = { label: "snake_case",        alwaysShow: true, };
const snakeUpperCaseQPI:  QuickPickItem = { label: "UPPER_SNAKE_CASE",  alwaysShow: true, };
const capitalCaseQPI:     QuickPickItem = { label: "Capital Case",      alwaysShow: true, };
const pathCaseQPI:        QuickPickItem = { label: "path/case",         alwaysShow: true, };
const quickPickItems:     QuickPickItem[] = [ kebabCaseQPI,
                                              camelCaseQPI, pascalCaseQPI,
                                              snakeCaseQPI, snakeUpperCaseQPI,
                                              capitalCaseQPI,
                                              pathCaseQPI ];

function transformQuery2RegExp(query: string, scope: string) {
  switch(scope) {
    case "kebab-case":
      return paramCase(query);
    case "camelCase":
      return camelCase(query);
    case "PascalCase":
      return pascalCase(query);
    case "snake_case":
      return snakeCase(query);
    case "UPPER_SNAKE_CASE":
      return constantCase(query);
    case "Capital Case":
      return capitalCase(query);
    case "path/case":
      return pathCase(query);
  }
}

// build regex query with all cases selected
function buildRegexQuery(query: string, selectedItems: readonly QuickPickItem[]): string {
  let queries: String[] = [];
  for (let item of selectedItems) {
    let queryScope = transformQuery2RegExp(query, item.label) || query;
    queries.push(queryScope);
  }

  return removeDuplicates(queries).join("|");
}

/**
 * Construct a copy of an array with duplicate items removed.
 * Where duplicate items exist, only the first instance will be kept.
 */
function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Read selectedItems (cases) from context.workspaceState
function readSelectedItems(context: ExtensionContext): QuickPickItem[] {
  let selectedItems: QuickPickItem[] = [];
  for (let quickPickItem of quickPickItems) {
    if (context.workspaceState.get<boolean>(quickPickItem.label, false) === true) {
      selectedItems.push(quickPickItem);
    }
  }
  console.log("readSelectedItems", selectedItems);
  return selectedItems;
}

// Save selectedItems (cases) into context.workspaceState
function saveSelectedItems(context: ExtensionContext, selectedItems: readonly QuickPickItem[]) {
  for (let quickPickItem of quickPickItems) {
    let selected = selectedItems.findIndex(item=> item === quickPickItem) >= 0;
    context.workspaceState.update(quickPickItem.label, selected);
    // console.log("previouslySelectedItems", previouslySelectedItems);
  }  
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('case-search.showSearchBox', async () => {

    const quickPick = window.createQuickPick();
    quickPick.items = quickPickItems;
    quickPick.canSelectMany = true;
    quickPick.selectedItems = readSelectedItems(context);
    quickPick.placeholder = "please input query text, default scope is all cases";
    quickPick.onDidAccept(() => {
      // console.log("onDidAccept", "value", quickPick.value, "selectedItems", quickPick.selectedItems);
      saveSelectedItems(context, quickPick.selectedItems);

      if (quickPick.value) {
        // If no selectedItems, we take all quickPickItems
        let items = quickPick.selectedItems.length <= 0 ? quickPickItems : quickPick.selectedItems;
        let query = buildRegexQuery(quickPick.value, items);
        // console.log("query", query);

        commands.executeCommand("workbench.action.findInFiles", {
          query: query, triggerSearch: true, isRegex: true, isCaseSensitive: true
        });
      }
      quickPick.hide();
    });

    quickPick.show();
  }));
}

export function deactivate() {}

// Exports for test only
export const exportedForTesting = {
  kebabCaseQPI,
  camelCaseQPI,
  pascalCaseQPI,
  snakeCaseQPI,
  snakeUpperCaseQPI,
  capitalCaseQPI,
  pathCaseQPI,
  transformQuery2RegExp,
  buildRegexQuery,
};
