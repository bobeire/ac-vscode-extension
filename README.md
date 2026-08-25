# AutonomousCompiler Bridge

This VS Code extension bridges AI-generated code into the AutonomousCompiler
filesystem and lets you trigger `ac` commands.

## Features

- Apply JSON payloads containing multiple files to the project
- Apply selected text as a single file
- Run `ac export zip`
- Run `ac github push`

## Configuration

Set the base directory of your AutonomousCompiler project:

- Open Settings
- Search for `acBridge.baseDir`
- Set to the absolute path of your project

## JSON format

Use this format with the "Apply JSON to Filesystem" command:

```json
{
  "files": [
    { "path": "src/core/virtualfs.ts", "content": "..." },
    { "path": "src/core/parser.ts", "content": "..." }
  ]
}
