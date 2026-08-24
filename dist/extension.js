"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getBaseDir() {
    const cfg = vscode.workspace.getConfiguration("acBridge");
    const baseDir = cfg.get("baseDir");
    if (!baseDir) {
        vscode.window.showErrorMessage("acBridge.baseDir is not set.");
        return;
    }
    return baseDir;
}
async function applyJson() {
    const baseDir = getBaseDir();
    if (!baseDir)
        return;
    const input = await vscode.window.showInputBox({
        prompt: "Paste JSON with files: { files: [{ path, content }] }"
    });
    if (!input)
        return;
    try {
        const payload = JSON.parse(input);
        for (const f of payload.files) {
            const full = path.join(baseDir, f.path);
            fs.mkdirSync(path.dirname(full), { recursive: true });
            fs.writeFileSync(full, f.content, "utf8");
        }
        vscode.window.showInformationMessage(`Wrote ${payload.files.length} file(s) to ${baseDir}`);
    }
    catch (e) {
        vscode.window.showErrorMessage(`JSON parse/write error: ${e.message}`);
    }
}
async function applySelection() {
    const baseDir = getBaseDir();
    if (!baseDir)
        return;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor.");
        return;
    }
    const sel = editor.selection;
    const text = editor.document.getText(sel.isEmpty ? undefined : sel);
    const relPath = await vscode.window.showInputBox({
        prompt: "Relative file path (e.g. src/core/virtualfs.ts)"
    });
    if (!relPath)
        return;
    const full = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, text, "utf8");
    vscode.window.showInformationMessage(`Wrote ${full}`);
}
async function runAcCommand(args) {
    const baseDir = getBaseDir();
    if (!baseDir)
        return;
    const term = vscode.window.createTerminal({
        name: "AutonomousCompiler",
        cwd: baseDir
    });
    term.show();
    term.sendText(`npx ${args.join(" ")}`);
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("acBridge.applyJson", applyJson), vscode.commands.registerCommand("acBridge.applySelection", applySelection), vscode.commands.registerCommand("acBridge.runAcExportZip", () => runAcCommand(["ac", "export", "zip"])), vscode.commands.registerCommand("acBridge.runAcGithubPush", () => runAcCommand(["ac", "github", "push"])));
}
function deactivate() { }
