import * as assert from 'assert';

import { EMPTY_CATCH_ROASTS, CONSOLE_LOG_ROASTS, TODO_FIXME_ROASTS, roastForIssue } from '../roasts';

suite('roasts', () => {
	test('the same issue always gets the same roast', () => {
		const first = roastForIssue('emptyCatch', '3:Empty catch block: errors are silently swallowed');
		const second = roastForIssue('emptyCatch', '3:Empty catch block: errors are silently swallowed');
		assert.strictEqual(first, second);
	});

	test('each kind picks from its own list', () => {
		assert.ok(EMPTY_CATCH_ROASTS.includes(roastForIssue('emptyCatch', '1:x')));
		assert.ok(CONSOLE_LOG_ROASTS.includes(roastForIssue('consoleLog', '6:x')));
		assert.ok(TODO_FIXME_ROASTS.includes(roastForIssue('todoFixme', '1:x')));
	});

	test('different issues can get different roasts', () => {
		const roasts = new Set([
			roastForIssue('emptyCatch', '1:a'),
			roastForIssue('emptyCatch', '2:b'),
			roastForIssue('emptyCatch', '3:c'),
			roastForIssue('emptyCatch', '4:d'),
			roastForIssue('emptyCatch', '5:e')
		]);
		assert.ok(roasts.size > 1);
	});
});
