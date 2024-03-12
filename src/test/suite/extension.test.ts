import * as assert from 'assert';
import * as vscode from 'vscode';

import { exportedForTesting } from '../../extension';
const { kebabCaseQPI, camelCaseQPI, pascalCaseQPI, snakeCaseQPI, snakeUpperCaseQPI } = exportedForTesting;
const { capitalCaseQPI, pathCaseQPI } = exportedForTesting;
 const { transformQuery2RegExp, buildRegexQuery } = exportedForTesting;


suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('transformQuery2RegExp', () => {
		assert.strictEqual("one-two-three-four", transformQuery2RegExp("oneTwoThreeFour",    "kebab-case"));
		assert.strictEqual("one-two-three-four", transformQuery2RegExp("one two_three-Four", "kebab-case"));
		assert.strictEqual("oneTwoThreeFour",    transformQuery2RegExp("oneTwoThreeFour",    "camelCase"));
		assert.strictEqual("oneTwoThreeFour",    transformQuery2RegExp("one two_three-Four", "camelCase"));
		assert.strictEqual("OneTwoThreeFour",    transformQuery2RegExp("oneTwoThreeFour",    "PascalCase"));
		assert.strictEqual("OneTwoThreeFour",    transformQuery2RegExp("one two_three-Four", "PascalCase"));
		assert.strictEqual("one_two_three_four", transformQuery2RegExp("oneTwoThreeFour",    "snake_case"));
		assert.strictEqual("one_two_three_four", transformQuery2RegExp("one two_three-Four", "snake_case"));
		assert.strictEqual("ONE_TWO_THREE_FOUR", transformQuery2RegExp("oneTwoThreeFour",    "UPPER_SNAKE_CASE"));
		assert.strictEqual("ONE_TWO_THREE_FOUR", transformQuery2RegExp("one two_three-Four", "UPPER_SNAKE_CASE"));
		assert.strictEqual("One Two Three Four", transformQuery2RegExp("oneTwoThreeFour",    "Capital Case"));
		assert.strictEqual("One Two Three Four", transformQuery2RegExp("one two_three-Four", "Capital Case"));
		assert.strictEqual("one/two/three/four", transformQuery2RegExp("oneTwoThreeFour",    "path/case"));
		assert.strictEqual("one/two/three/four", transformQuery2RegExp("one two_three-Four", "path/case"));
	});

	test('buildRegexQuery', () => {
		const query = "one two_three-Four";

		assert.strictEqual("", buildRegexQuery(query, []));

		assert.strictEqual("one-two-three-four", buildRegexQuery(query, [kebabCaseQPI]));
		assert.strictEqual("oneTwoThreeFour",    buildRegexQuery(query, [camelCaseQPI]));
		assert.strictEqual("OneTwoThreeFour",    buildRegexQuery(query, [pascalCaseQPI]));
		assert.strictEqual("one_two_three_four", buildRegexQuery(query, [snakeCaseQPI]));
		assert.strictEqual("ONE_TWO_THREE_FOUR", buildRegexQuery(query, [snakeUpperCaseQPI]));
		assert.strictEqual("One Two Three Four", buildRegexQuery(query, [capitalCaseQPI]));
		assert.strictEqual("one/two/three/four", buildRegexQuery(query, [pathCaseQPI]));

		assert.strictEqual("one-two-three-four|oneTwoThreeFour",
						    buildRegexQuery(query, [kebabCaseQPI, camelCaseQPI]));

		assert.strictEqual("oneTwoThreeFour|One Two Three Four",
						    buildRegexQuery(query, [camelCaseQPI, capitalCaseQPI]));

		assert.strictEqual("OneTwoThreeFour|one_two_three_four|ONE_TWO_THREE_FOUR",
							buildRegexQuery(query, [pascalCaseQPI, snakeCaseQPI, snakeUpperCaseQPI]));

		assert.strictEqual("OneTwoThreeFour|one_two_three_four|ONE_TWO_THREE_FOUR|oneTwoThreeFour|one-two-three-four",
							buildRegexQuery(query, [pascalCaseQPI, snakeCaseQPI, snakeUpperCaseQPI, camelCaseQPI, kebabCaseQPI]));

		// Duplicates are removed
		assert.strictEqual("OneTwoThreeFour|ONE_TWO_THREE_FOUR",
		                    buildRegexQuery(query, [pascalCaseQPI,snakeUpperCaseQPI,pascalCaseQPI]));
	});
});
