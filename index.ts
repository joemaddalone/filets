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


import * as fs from 'node:fs';
import * as path from 'node:path';

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
			throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Check if a path is writable
	 */
	public static isWritable(dirPath: string): boolean {
		try {
			// Try to create a temporary file to test write permissions
			const testFile = path.join(dirPath, '.write-test');
			fs.writeFileSync(testFile, 'test');
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
			.replace(/[<>:"/\\|?*]/g, '-') // Replace invalid characters
			.replace(/[''""`´]/g, '') // Remove apostrophes and quotes
			.replace(/[.,;:!@#$%^&*()_+={}\[\]|\\/]/g, '') // Remove other punctuation
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/-+/g, '-') // Replace multiple hyphens with single
			.replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
			.substring(0, 255); // Limit length
	}

	/**
	 * Write JSON data to a file
	 */
	public static writeJsonFile(filePath: string, data: any): void {
		try {
			// Ensure directory exists
			const dirPath = path.dirname(filePath);
			Filets.ensureDirectoryExists(dirPath);

			// Write JSON file
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
		} catch (error) {
			throw new Error(`Failed to write JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Write text data to a file
	 */
	public static writeTextFile(filePath: string, content: string): void {
		try {
			// Ensure directory exists
			const dirPath = path.dirname(filePath);
			Filets.ensureDirectoryExists(dirPath);

			// Write text file
			fs.writeFileSync(filePath, content, 'utf8');
		} catch (error) {
			throw new Error(`Failed to write text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
			throw new Error(`Failed to get file size: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
			throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
			throw new Error(`Failed to remove file: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
			throw new Error(`Failed to remove directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Copy a file to a new location
	 */
	public static copyFile(sourcePath: string, destPath: string): void {
		try {
			// Ensure destination directory exists
			const destDir = path.dirname(destPath);
			Filets.ensureDirectoryExists(destDir);

			// Copy file
			fs.copyFileSync(sourcePath, destPath);
		} catch (error) {
			throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
}
