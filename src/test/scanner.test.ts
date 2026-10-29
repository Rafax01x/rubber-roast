import * as assert from 'assert';

import { scanDocument } from '../scanner';

suite('scanner', () => {
	test('reports an empty catch block on one line', () => {
		const issues = scanDocument('try {\n\tdoThing();\n} catch (e) {}');
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].line, 3);
		assert.strictEqual(issues[0].severity, 'high');
		assert.strictEqual(issues[0].kind, 'emptyCatch');
		assert.match(issues[0].message, /empty catch/i);
	});

	test('reports an empty catch block spread over several lines', () => {
		const issues = scanDocument('try {\n\tdoThing();\n} catch (e) {\n}');
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].line, 3);
	});

	test('reports an empty catch with only a comment inside', () => {
		const issues = scanDocument('try {\n\tdoThing();\n} catch (e) {\n\t// ignore\n}');
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].line, 3);
	});

	test('reports an empty catch without a binding', () => {
		const issues = scanDocument('try {\n\tdoThing();\n} catch {}');
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].line, 3);
	});

	test('does not report a catch block that handles the error', () => {
		const issues = scanDocument('try {\n\tdoThing();\n} catch (e) {\n\tconsole.error(e);\n}');
		assert.strictEqual(issues.length, 0);
	});

	test('does not report 5 console.log calls', () => {
		const text = Array.from({ length: 5 }, (_, i) => `console.log(${i});`).join('\n');
		assert.strictEqual(scanDocument(text).length, 0);
	});

	test('reports more than 5 console.log calls once, at the first log past the limit', () => {
		const text = Array.from({ length: 7 }, (_, i) => `console.log(${i});`).join('\n');
		const issues = scanDocument(text);
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].line, 6);
		assert.strictEqual(issues[0].severity, 'medium');
		assert.strictEqual(issues[0].kind, 'consoleLog');
		assert.match(issues[0].message, /7 console\.log/);
	});

	test('reports a TODO in a line comment', () => {
		const issues = scanDocument('const x = 1; // TODO: handle edge case');
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].line, 1);
		assert.strictEqual(issues[0].severity, 'low');
		assert.strictEqual(issues[0].kind, 'todoFixme');
		assert.match(issues[0].message, /TODO/);
	});

	test('reports a FIXME in a block comment', () => {
		const issues = scanDocument('/* FIXME: this breaks on empty input */\nconst x = 1;');
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].line, 1);
		assert.strictEqual(issues[0].severity, 'medium');
		assert.match(issues[0].message, /FIXME/);
	});

	test('does not count console.log inside a comment', () => {
		const issues = scanDocument('// console.log("not real code")\nconst x = 1;');
		assert.strictEqual(issues.length, 0);
	});

	test('returns no issues for a clean file', () => {
		const issues = scanDocument('const x = 1;\nconsole.log(x);\n');
		assert.deepStrictEqual(issues, []);
	});

	test('returns no issues for an empty file', () => {
		assert.deepStrictEqual(scanDocument(''), []);
	});

	test('orders issues by line', () => {
		const issues = scanDocument('// TODO: first\ntry {\n\tdoThing();\n} catch (e) {}');
		assert.deepStrictEqual(issues.map(issue => issue.line), [1, 4]);
	});
});
