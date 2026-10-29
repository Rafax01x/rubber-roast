// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { scanDocument } from './scanner';

// Dim yellow, used for every roast issue's inline text.
const DIM_YELLOW = '#b5a642';

// The decoration type only defines the look: the per-issue message is
// supplied per decoration through renderOptions below.
const roastDecorationType = vscode.window.createTextEditorDecorationType({
	after: {
		margin: '0 0 0 1em',
		color: DIM_YELLOW
	}
});

function updateRoastDecorations(editor: vscode.TextEditor | undefined): void {
	if (!editor) {
		return;
	}

	const document = editor.document;
	const issues = scanDocument(document.getText());

	const decorations: vscode.DecorationOptions[] = issues
		.filter(issue => issue.line >= 1 && issue.line <= document.lineCount)
		.map(issue => {
			const lineIndex = issue.line - 1;
			const end = document.lineAt(lineIndex).range.end;
			return {
				range: new vscode.Range(end, end),
				renderOptions: {
					after: {
						contentText: ` ${issue.message}`,
						color: DIM_YELLOW
					}
				}
			};
		});

	editor.setDecorations(roastDecorationType, decorations);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "rubber-roast" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('rubber-roast.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from rubber-roast!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(roastDecorationType);

	const outputChannel = vscode.window.createOutputChannel('Rubber Roast');
	context.subscriptions.push(outputChannel);

	const roastFile = vscode.commands.registerCommand('rubber-roast.roastFile', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No file open to roast.');
			return;
		}

		const document = editor.document;
		const issues = scanDocument(document.getText());
		updateRoastDecorations(editor);

		const fileName = document.fileName.split('/').pop() ?? document.fileName;
		outputChannel.appendLine(`Roast results for ${fileName}:`);

		if (issues.length === 0) {
			outputChannel.appendLine('No roast issues found.');
			outputChannel.show(true);
			vscode.window.showInformationMessage(`No roast issues found in ${fileName}.`);
			return;
		}

		for (const issue of issues) {
			outputChannel.appendLine(`Line ${issue.line} [${issue.severity}] ${issue.message}`);
		}
		outputChannel.show(true);
		vscode.window.showInformationMessage(
			`Found ${issues.length} roast issue${issues.length === 1 ? '' : 's'} in ${fileName} — see the Rubber Roast output channel.`
		);
	});

	context.subscriptions.push(roastFile);

	// Show roast issues for the editor that is already open, if any.
	updateRoastDecorations(vscode.window.activeTextEditor);

	// Re-scan and re-render inline messages every time a file is saved.
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument(document => {
			for (const editor of vscode.window.visibleTextEditors) {
				if (editor.document.uri.toString() === document.uri.toString()) {
					updateRoastDecorations(editor);
				}
			}
		})
	);

	// Keep decorations in step when switching between editors.
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			updateRoastDecorations(editor);
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
