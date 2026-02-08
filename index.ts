/** biome-ignore-all lint/complexity/noStaticOnlyClass: i dont care */

// Filets: A File Management Library
//
// Developed by Joe Maddalone
// https://github.com/joemaddalone/filets
//
// MIT License
//
// Copyright (c) 2025 Joe Maddalone
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as fs from "node:fs";
import * as path from "node:path";

export class Filets {
	/**
	 * Ensure a directory exists, creating it if necessary
	 */
	public static ensureDirectoryExists(dirPath: string): void {
		try {
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
			}
		} catch (error) {
			throw new Error(
				`Failed to create directory: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Check if a path is writable
	 */
	public static isWritable(dirPath: string): boolean {
		try {
			// Try to create a temporary file to test write permissions
			const testFile = Filets.joinPaths(dirPath, ".write-test");
			fs.writeFileSync(testFile, "test");
			fs.unlinkSync(testFile);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Sanitize a filename for safe file system usage
	 */
	public static sanitizeFilename(filename: string): string {
		return filename
			.replace(/[<>:"/\\|?*]/g, "-") // Replace invalid characters
			.replace(/[''""`´]/g, "") // Remove apostrophes and quotes
			.replace(/[.,;:!@#$%^&*()_+={}[\]|\\/]/g, "") // Remove other punctuation
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Replace multiple hyphens with single
			.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
			.substring(0, 255); // Limit length
	}

	/**
	 * Write JSON data to a file
	 */
	public static writeJsonFile(filePath: string, data: object): void {
		try {
			// Ensure directory exists
			const dirPath = Filets.getDirectoryName(filePath);
			Filets.ensureDirectoryExists(dirPath);

			// Write JSON file
			Filets.writeTextFile(filePath, JSON.stringify(data, null, 2));
		} catch (error) {
			throw new Error(
				`Failed to write JSON file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Read a json file
	 */
	public static readJsonFile(filePath: string): object {
		const json = Filets.readTextFile(filePath);
		return JSON.parse(json);
	}

	/**
	 * Read text file content
	 */
	public static readTextFile(filePath: string): string {
		try {
			return fs.readFileSync(filePath, "utf8");
		} catch (error) {
			throw new Error(
				`Failed to read text file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Write text data to a file
	 */
	public static writeTextFile(filePath: string, content: string): void {
		try {
			// Ensure directory exists
			const dirPath = Filets.getDirectoryName(filePath);
			Filets.ensureDirectoryExists(dirPath);

			// Write text file
			fs.writeFileSync(filePath, content, "utf8");
		} catch (error) {
			throw new Error(
				`Failed to write text file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Append text content to a file
	 */
	public static appendTextFile(filePath: string, content: string): void {
		try {
			// Ensure directory exists
			const dirPath = Filets.getDirectoryName(filePath);
			Filets.ensureDirectoryExists(dirPath);

			// Append to file
			fs.appendFileSync(filePath, content, "utf8");
		} catch (error) {
			throw new Error(
				`Failed to append to text file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Check if a file exists
	 */
	public static fileExists(filePath: string): boolean {
		try {
			return fs.existsSync(filePath);
		} catch {
			return false;
		}
	}

	/**
	 * Check if a directory exists
	 */
	public static directoryExists(dirPath: string): boolean {
		try {
			return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
		} catch {
			return false;
		}
	}

	/**
	 * Get file size in bytes
	 */
	public static getFileSize(filePath: string): number {
		try {
			const stats = fs.statSync(filePath);
			return stats.size;
		} catch (error) {
			throw new Error(
				`Failed to get file size: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Get directory contents
	 */
	public static getDirectoryContents(dirPath: string): string[] {
		try {
			if (!Filets.directoryExists(dirPath)) {
				return [];
			}
			return fs.readdirSync(dirPath);
		} catch (error) {
			throw new Error(
				`Failed to read directory: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Remove a file
	 */
	public static removeFile(filePath: string): void {
		try {
			if (Filets.fileExists(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (error) {
			throw new Error(
				`Failed to remove file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Remove a directory and its contents
	 */
	public static removeDirectory(dirPath: string): void {
		try {
			if (Filets.directoryExists(dirPath)) {
				fs.rmSync(dirPath, { recursive: true, force: true });
			}
		} catch (error) {
			throw new Error(
				`Failed to remove directory: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Copy a file to a new location
	 */
	public static copyFile(sourcePath: string, destPath: string): void {
		try {
			// Ensure destination directory exists
			const destDir = Filets.getDirectoryName(destPath);
			Filets.ensureDirectoryExists(destDir);

			// Copy file
			fs.copyFileSync(sourcePath, destPath);
		} catch (error) {
			throw new Error(
				`Failed to copy file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Get absolute path, resolving relative paths
	 */
	public static getAbsolutePath(filePath: string): string {
		return path.resolve(filePath);
	}

	/**
	 * Get relative path from base directory
	 */
	public static getRelativePath(filePath: string, baseDir: string): string {
		return path.relative(baseDir, filePath);
	}

	/**
	 * Join path segments safely
	 */
	public static joinPaths(...paths: string[]): string {
		return path.join(...paths);
	}

	/**
	 * Move a file to a new location
	 */
	public static moveFile(sourcePath: string, destPath: string): void {
		try {
			// Ensure destination directory exists
			const destDir = Filets.getDirectoryName(destPath);
			Filets.ensureDirectoryExists(destDir);

			// Move file
			Filets.renameFile(sourcePath, destPath);
		} catch (error) {
			throw new Error(
				`Failed to move file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Rename a file
	 */
	public static renameFile(oldPath: string, newPath: string): void {
		try {
			fs.renameSync(oldPath, newPath);
		} catch (error) {
			throw new Error(
				`Failed to rename file: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Create a directory explicitly (throws if already exists)
	 */
	public static createDirectory(dirPath: string): void {
		try {
			if (Filets.directoryExists(dirPath)) {
				throw new Error(`Directory already exists: ${dirPath}`);
			}

			Filets.ensureDirectoryExists(dirPath);
		} catch (error) {
			throw new Error(
				`Failed to create directory: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Check if a directory is empty
	 */
	public static isEmptyDirectory(dirPath: string): boolean {
		try {
			if (!Filets.directoryExists(dirPath)) {
				throw new Error(`Directory does not exist: ${dirPath}`);
			}
			const contents = Filets.getDirectoryContents(dirPath);
			return contents.length === 0;
		} catch (error) {
			throw new Error(
				`Failed to check if directory is empty: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Copy an entire directory recursively
	 */
	public static copyDirectory(sourceDir: string, destDir: string): void {
		try {
			if (!Filets.directoryExists(sourceDir)) {
				throw new Error(`Source directory does not exist: ${sourceDir}`);
			}

			// Create destination directory
			Filets.ensureDirectoryExists(destDir);

			// Read source directory contents
			const contents = Filets.getDirectoryContents(sourceDir);

			for (const item of contents) {
				const sourcePath = Filets.joinPaths(sourceDir, item);
				const destPath = Filets.joinPaths(destDir, item);

				if (Filets.isDirectory(sourcePath)) {
					// Recursively copy subdirectory
					Filets.copyDirectory(sourcePath, destPath);
				} else {
					// Copy file
					fs.copyFileSync(sourcePath, destPath);
				}
			}
		} catch (error) {
			throw new Error(
				`Failed to copy directory: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Move an entire directory
	 */
	public static moveDirectory(sourceDir: string, destDir: string): void {
		try {
			if (!Filets.directoryExists(sourceDir)) {
				throw new Error(`Source directory does not exist: ${sourceDir}`);
			}

			// Ensure destination parent directory exists
			const destParent = Filets.getDirectoryName(destDir);
			Filets.ensureDirectoryExists(destParent);

			// Move directory
			fs.renameSync(sourceDir, destDir);
		} catch (error) {
			throw new Error(
				`Failed to move directory: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Normalize path separators
	 */
	public static normalizePath(filePath: string): string {
		return path.normalize(filePath);
	}

	/**
	 * Get directory name from path
	 */
	public static getDirectoryName(filePath: string): string {
		return path.dirname(filePath);
	}

	/**
	 * Get file extension
	 */
	public static getFileExtension(filePath: string): string {
		return path.extname(filePath);
	}

	/**
	 * Change file extension
	 */
	public static changeFileExtension(filePath: string, newExtension: string): string {
		const parsedPath = path.parse(filePath);
		// Ensure new extension starts with dot if not already
		const ext = newExtension.startsWith('.') ? newExtension : `.${newExtension}`;
		return Filets.joinPaths(parsedPath.dir, `${parsedPath.name}${ext}`);
	}

	/**
	 * Find files matching pattern
	 */
	public static findFiles(dirPath: string, pattern?: string): string[] {
		try {
			const files: string[] = [];
			const contents = fs.readdirSync(dirPath);

			for (const item of contents) {
				const itemPath = Filets.joinPaths(dirPath, item);
				const stats = fs.statSync(itemPath);

				if (stats.isFile()) {
					// If no pattern or pattern matches, include file
					if (!pattern || item.includes(pattern)) {
						files.push(itemPath);
					}
				} else if (stats.isDirectory()) {
					// Recursively search subdirectories
					files.push(...Filets.findFiles(itemPath, pattern));
				}
			}

			return files;
		} catch (error) {
			throw new Error(
				`Failed to find files: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Find directories matching pattern
	 */
	public static findDirectories(dirPath: string, pattern?: string): string[] {
		try {
			const directories: string[] = [];
			const contents = fs.readdirSync(dirPath);

			for (const item of contents) {
				const itemPath = Filets.joinPaths(dirPath, item);
				const stats = fs.statSync(itemPath);

				if (stats.isDirectory()) {
					// If no pattern or pattern matches, include directory
					if (!pattern || item.includes(pattern)) {
						directories.push(itemPath);
					}
					// Recursively search subdirectories
					directories.push(...Filets.findDirectories(itemPath, pattern));
				}
			}

			return directories;
		} catch (error) {
			throw new Error(
				`Failed to find directories: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Get complete file stats
	 */
	public static getFileStats(filePath: string): fs.Stats {
		try {
			return fs.statSync(filePath);
		} catch (error) {
			throw new Error(
				`Failed to get file stats: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}

	/**
	 * Check if path is a file
	 */
	public static isFile(filePath: string): boolean {
		try {
			const stats = fs.statSync(filePath);
			return stats.isFile();
		} catch {
			return false;
		}
	}

	/**
	 * Check if path is a directory
	 */
	public static isDirectory(filePath: string): boolean {
		try {
			const stats = fs.statSync(filePath);
			return stats.isDirectory();
		} catch {
			return false;
		}
	}

	/**
	 * Get filename without path
	 */
	public static getFileName(filePath: string): string {
		return path.basename(filePath);
	}

	/**
	 * Get filename without extension
	 */
	public static getFileNameWithoutExtension(filePath: string): string {
		const parsedPath = path.parse(filePath);
		return parsedPath.name;
	}
}
