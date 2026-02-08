<h1 align="center" id="title">filets</h1>
<div align="center">

![Filets](https://img.shields.io/badge/Filets-File%20Management-blue?style=for-the-badge)
[![Buy Me A Coffee](https://img.shields.io/badge/Support-Buy%20Me%20A%20Coffee-orange?style=for-the-badge)](https://buymeacoffee.com/joemaddalone)

</div>

Filets is a collection of file system tools for Node.js. It is a File tool in Typescript, hence FileTS.

## Installation

```bash
npm install @joemaddalone/filets
```

## Usage

Import the Filets class and use it:

```typescript
import { Filets } from "@joemaddalone/filets";

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

// Read text file content
const content = Filets.readTextFile("./my-file.txt");

// Append text content to a file
Filets.appendTextFile("./my-file.txt", " More content");

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

// Move a file
Filets.moveFile("./my-file.txt", "./new-location/my-file.txt");

// Rename a file
Filets.renameFile("./old-name.txt", "./new-name.txt");

// Create a directory explicitly (throws if exists)
Filets.createDirectory("./my-new-directory");

// Check if a directory is empty
Filets.isEmptyDirectory("./my-directory");

// Copy an entire directory
Filets.copyDirectory("./source-directory", "./destination-directory");

// Move an entire directory
Filets.moveDirectory("./old-directory", "./new-directory");

// Get absolute path
Filets.getAbsolutePath("./my-file.txt");

// Get relative path
Filets.getRelativePath("./my-file.txt", "./my-directory");

// Join paths
Filets.joinPaths("./my-directory", "my-file.txt");

// Normalize path separators
Filets.normalizePath("path//with///multiple/separators");

// Get directory name from path
Filets.getDirectoryName("/path/to/file.txt");

// Get file extension
Filets.getFileExtension("/path/to/file.txt");

// Change file extension
Filets.changeFileExtension("/path/to/file.txt", ".json");

// Find files matching pattern
Filets.findFiles("./directory", ".txt");

// Find directories matching pattern
Filets.findDirectories("./directory", "src");

// Get complete file stats
Filets.getFileStats("./my-file.txt");

// Check if path is a file
Filets.isFile("./my-file.txt");

// Check if path is a directory
Filets.isDirectory("./my-directory");

// Get filename without path
Filets.getFileName("/path/to/file.txt");

// Get filename without extension
Filets.getFileNameWithoutExtension("/path/to/file.txt");
```
