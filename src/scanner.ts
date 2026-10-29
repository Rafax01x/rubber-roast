export type RoastSeverity = 'low' | 'medium' | 'high';

/** Which roast list an issue maps to. Used to pick its funny message. */
export type RoastKind = 'emptyCatch' | 'consoleLog' | 'todoFixme';

export interface RoastIssue {
	line: number;
	message: string;
	severity: RoastSeverity;
	kind: RoastKind;
}

const MAX_CONSOLE_LOG = 5;

interface LineParts {
	code: string;
	comment: string;
}

/**
 * Split each line into its code part and its comment part, tracking
 * multi-line block comments (e.g. a TODO inside a block comment is
 * still a comment, and a `console.log` inside one is not real code).
 * String literals are not parsed: a `//` inside a string would be
 * misread, which is an accepted simplification for this scanner.
 */
function splitCodeAndComments(lines: string[]): LineParts[] {
	const parts: LineParts[] = [];
	let inBlock = false;

	for (const raw of lines) {
		let code = '';
		let comment = '';
		let i = 0;

		while (i < raw.length) {
			if (inBlock) {
				const end = raw.indexOf('*/', i);
				if (end === -1) {
					comment += raw.slice(i);
					i = raw.length;
				} else {
					comment += raw.slice(i, end + 2);
					inBlock = false;
					i = end + 2;
				}
				continue;
			}

			const lineComment = raw.indexOf('//', i);
			const blockStart = raw.indexOf('/*', i);

			if (lineComment !== -1 && (blockStart === -1 || lineComment < blockStart)) {
				code += raw.slice(i, lineComment);
				comment += raw.slice(lineComment);
				break;
			}
			if (blockStart !== -1) {
				code += raw.slice(i, blockStart);
				const end = raw.indexOf('*/', blockStart + 2);
				if (end === -1) {
					comment += raw.slice(blockStart);
					inBlock = true;
					i = raw.length;
				} else {
					comment += raw.slice(blockStart, end + 2);
					i = end + 2;
				}
				continue;
			}

			code += raw.slice(i);
			break;
		}

		parts.push({ code, comment });
	}

	return parts;
}

/** Remove comment text from a snippet, leaving only real code. */
function stripComments(text: string): string {
	return splitCodeAndComments(text.split('\n'))
		.map(part => part.code)
		.join('\n');
}

function findEmptyCatches(parts: LineParts[]): RoastIssue[] {
	const issues: RoastIssue[] = [];
	const catchPattern = /\bcatch\s*(?:\([^)]*\))?\s*\{/g;

	for (let lineIndex = 0; lineIndex < parts.length; lineIndex++) {
		const code = parts[lineIndex].code;
		catchPattern.lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = catchPattern.exec(code)) !== null) {
			// Walk forward counting braces until this catch block closes.
			// The opening brace was already consumed by the match, so
			// the block starts at depth 1.
			let depth = 1;
			let body = '';
			let closed = false;

			for (let j = lineIndex; j < parts.length && !closed; j++) {
				const segment = j === lineIndex
					? parts[j].code.slice(match.index + match[0].length)
					: parts[j].code;
				for (const ch of segment) {
					if (ch === '{') {
						depth++;
					} else if (ch === '}') {
						depth--;
						if (depth === 0) {
							closed = true;
							break;
						}
					} else if (depth >= 1) {
						body += ch;
					}
				}
			}

			// A block is "empty" when its body holds nothing but
			// whitespace. Comments were already split out, so a body
			// with only a comment also counts as empty.
			if (closed && stripComments(body).trim() === '') {
				issues.push({
					line: lineIndex + 1,
					message: 'Empty catch block: errors are silently swallowed',
					severity: 'high',
					kind: 'emptyCatch'
				});
			}
		}
	}

	return issues;
}

function findExcessConsoleLogs(parts: LineParts[]): RoastIssue[] {
	const logLines: number[] = [];

	for (let i = 0; i < parts.length; i++) {
		const matches = parts[i].code.match(/\bconsole\.log\s*\(/g);
		if (matches) {
			for (let k = 0; k < matches.length; k++) {
				logLines.push(i + 1);
			}
		}
	}

	if (logLines.length <= MAX_CONSOLE_LOG) {
		return [];
	}

	// One file-level issue, reported at the first log past the limit.
	return [{
		line: logLines[MAX_CONSOLE_LOG],
		message: `Found ${logLines.length} console.log calls in this file (more than ${MAX_CONSOLE_LOG})`,
		severity: 'medium',
		kind: 'consoleLog'
	}];
}

function findTodoFixme(parts: LineParts[]): RoastIssue[] {
	const issues: RoastIssue[] = [];

	for (let i = 0; i < parts.length; i++) {
		const comment = parts[i].comment;
		if (!comment) {
			continue;
		}
		const match = /\b(TODO|FIXME)\b/i.exec(comment);
		if (match) {
			const keyword = match[1].toUpperCase();
			issues.push({
				line: i + 1,
				message: `${keyword} found in comment: ${comment.trim()}`,
				severity: keyword === 'FIXME' ? 'medium' : 'low',
				kind: 'todoFixme'
			});
		}
	}

	return issues;
}

/**
 * Scan a document's text and return every issue found, ordered by line.
 *
 * Detects:
 * 1. Empty `catch` blocks (including `catch (e) {}` and `catch {}`).
 * 2. More than 5 `console.log` calls in one file (one issue, at the
 *    first log past the limit).
 * 3. Comments containing TODO or FIXME (line and block comments).
 */
export function scanDocument(text: string): RoastIssue[] {
	if (text === '') {
		return [];
	}

	const lines = text.split('\n');
	const parts = splitCodeAndComments(lines);

	const issues = [
		...findEmptyCatches(parts),
		...findExcessConsoleLogs(parts),
		...findTodoFixme(parts)
	];

	// Stable sort by line: Array.sort is stable in modern Node, so
	// issues on the same line keep their detection order.
	return issues.sort((a, b) => a.line - b.line);
}
