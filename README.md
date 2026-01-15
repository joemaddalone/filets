<h1 align="center" id="title">filets</h1>
<div align="center">

![Filets](https://img.shields.io/badge/Filets-File%20Management-blue?style=for-the-badge)
[![Buy Me A Coffee](https://img.shields.io/badge/Support-Buy%20Me%20A%20Coffee-orange?style=for-the-badge)](https://buymeacoffee.com/joemaddalone)

</div>

Filets is a collection of file system tools for Node.js. It is a File tool in Typescript, hence FileTS.

## Installation

```bash
npm install filets
```

## Usage

Import the Filets class and use it:

```typescript
import { Filets } from "filets";

// Ensure a directory exists
Filets.ensureDirectoryExists("./my-directory");

// Check if a directory is writable
Filets.isWritable("./my-directory");

// Sanitize a filename
Filets.sanitizeFilename("my-file.txt");

// Write JSON data to a file
Filets.writeJsonFile("./my-file.json", { name: "My File" });

// Write text data to a file
Filets.writeTextFile("./my-file.txt", "Hello, World!");

// Check if a file exists
Filets.fileExists("./my-file.txt");

// Check if a directory exists
Filets.directoryExists("./my-directory");

// Get file size
Filets.getFileSize("./my-file.txt");

// Get directory contents
Filets.getDirectoryContents("./my-directory");

// Remove a file
Filets.removeFile("./my-file.txt");

// Remove a directory
Filets.removeDirectory("./my-directory");

// Copy a file
Filets.copyFile("./my-file.txt", "./my-file-copy.txt");

// Get absolute path
Filets.getAbsolutePath("./my-file.txt");

// Get relative path
Filets.getRelativePath("./my-file.txt", "./my-directory");

// Join paths
Filets.joinPaths("./my-directory", "my-file.txt");
```
