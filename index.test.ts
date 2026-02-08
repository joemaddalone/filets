import { Filets } from "./index";
import * as fs from "node:fs";
import * as path from "node:path";
import {
	beforeEach,
	describe,
	expect,
	test,
	vi
} from "vitest";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	mkdirSync: vi.fn(),
	unlinkSync: vi.fn(),
	rmSync: vi.fn(),
	copyFileSync: vi.fn(),
	readFileSync: vi.fn(),
	writeFileSync: vi.fn(),
	appendFileSync: vi.fn(),
	readdirSync: vi.fn(),
	statSync: vi.fn(),
	renameSync: vi.fn(),
}));

describe("Filets", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("ensureDirectoryExists", () => {
		test("should create directory if it doesn't exist", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			Filets.ensureDirectoryExists("/test/dir");
			expect(fs.mkdirSync).toHaveBeenCalledWith("/test/dir", {
				recursive: true,
				mode: 0o755,
			});
		});

		test("should not create directory if it already exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			Filets.ensureDirectoryExists("/test/dir");
			expect(fs.mkdirSync).not.toHaveBeenCalled();
		});

		test("should throw error if mkdirSync fails", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			vi.mocked(fs.mkdirSync).mockImplementationOnce(() => {
				throw new Error("Permission denied");
			});
			expect(() => Filets.ensureDirectoryExists("/test/dir")).toThrow(
				"Failed to create directory: Permission denied",
			);
		});
	});

	describe("isWritable", () => {
		test("should return true if writing a test file succeeds", () => {
			Filets.isWritable("/test/dir");
			expect(fs.writeFileSync).toHaveBeenCalled();
			expect(fs.unlinkSync).toHaveBeenCalled();
			expect(Filets.isWritable("/test/dir")).toBe(true);
		});

		test("should return false if writing a test file fails", () => {
			vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
				throw new Error("No space left on device");
			});
			expect(Filets.isWritable("/test/dir")).toBe(false);
		});
	});

	describe("sanitizeFilename", () => {
		test("should remove invalid characters and format correctly", () => {
			const input = "Invalid/File:Name? *'\"`´!@#.txt";
			const result = Filets.sanitizeFilename(input);
			expect(result).toBe("Invalid-File-Name-txt");
		});

		test("should replace spaces with hyphens", () => {
			expect(Filets.sanitizeFilename("file name with spaces")).toBe(
				"file-name-with-spaces",
			);
		});

		test("should limit length to 255 characters", () => {
			const longName = "a".repeat(300);
			expect(Filets.sanitizeFilename(longName).length).toBe(255);
		});
	});

	describe("writeJsonFile", () => {
		test("should write stringified JSON to file", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			const data = { foo: "bar" };
			Filets.writeJsonFile("/test/file.json", data);
			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/test/file.json",
				JSON.stringify(data, null, 2),
				"utf8",
			);
		});

		test("should throw error if write fails", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
				throw new Error("Disk full");
			});
			expect(() => Filets.writeJsonFile("/test/file.json", {})).toThrow(
				"Failed to write JSON file: Failed to write text file: Disk full",
			);
		});
	});

	describe("writeTextFile", () => {
		test("should write text content to file", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			Filets.writeTextFile("/test/file.txt", "hello world");
			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/test/file.txt",
				"hello world",
				"utf8",
			);
		});
	});

	describe("readTextFile", () => {
		test("should read text file content", () => {
			vi.mocked(fs.readFileSync).mockReturnValue("file content");
			const result = Filets.readTextFile("/test/file.txt");
			expect(result).toBe("file content");
			expect(fs.readFileSync).toHaveBeenCalledWith("/test/file.txt", "utf8");
		});

		test("should throw error if read fails", () => {
			vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
				throw new Error("File not found");
			});
			expect(() => Filets.readTextFile("/test/file.txt")).toThrow(
				"Failed to read text file: File not found",
			);
		});
	});

	describe("appendTextFile", () => {
		test("should append text content to file", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			Filets.appendTextFile("/test/file.txt", " more content");
			expect(fs.appendFileSync).toHaveBeenCalledWith(
				"/test/file.txt",
				" more content",
				"utf8",
			);
		});

		test("should throw error if append fails", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.appendFileSync).mockImplementationOnce(() => {
				throw new Error("Permission denied");
			});
			expect(() => Filets.appendTextFile("/test/file.txt", "content")).toThrow(
				"Failed to append to text file: Permission denied",
			);
		});
	});

	describe("normalizePath", () => {
		test("should normalize path separators", () => {
			const result = Filets.normalizePath("path//with///multiple/separators");
			expect(result).toBe("path/with/multiple/separators");
		});
	});

	describe("getDirectoryName", () => {
		test("should get directory name from path", () => {
			const result = Filets.getDirectoryName("/path/to/file.txt");
			expect(result).toBe("/path/to");
		});
	});

	describe("getFileExtension", () => {
		test("should get file extension", () => {
			const result = Filets.getFileExtension("/path/to/file.txt");
			expect(result).toBe(".txt");
		});

		test("should return empty string if no extension", () => {
			const result = Filets.getFileExtension("/path/to/file");
			expect(result).toBe("");
		});
	});

	describe("changeFileExtension", () => {
		test("should change file extension with dot", () => {
			const result = Filets.changeFileExtension("/path/to/file.txt", ".json");
			expect(result).toBe("/path/to/file.json");
		});

		test("should change file extension without dot", () => {
			const result = Filets.changeFileExtension("/path/to/file.txt", "json");
			expect(result).toBe("/path/to/file.json");
		});
	});

	describe("findFiles", () => {
		test("should find all files without pattern", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(["file1.txt", "file2.js"] as any);
			vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);

			const result = Filets.findFiles("/test");
			expect(result).toHaveLength(2);
			expect(result[0]).toContain("file1.txt");
			expect(result[1]).toContain("file2.js");
		});

		test("should find files matching pattern", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(["file1.txt", "file2.js"] as any);
			vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);

			const result = Filets.findFiles("/test", ".txt");
			expect(result).toHaveLength(1);
			expect(result[0]).toContain("file1.txt");
		});
	});

	describe("getFileStats", () => {
		test("should get complete file stats", () => {
			const mockStats = {
				isFile: () => true,
				isDirectory: () => false,
				size: 1024,
				mtime: new Date(),
				ctime: new Date(),
			};
			vi.mocked(fs.statSync).mockReturnValue(mockStats as any);

			const result = Filets.getFileStats("/test/file.txt");
			expect(result).toBe(mockStats);
		});

		test("should throw error if stat fails", () => {
			vi.mocked(fs.statSync).mockImplementationOnce(() => {
				throw new Error("File not found");
			});
			expect(() => Filets.getFileStats("/test/file.txt")).toThrow(
				"Failed to get file stats: File not found",
			);
		});
	});

	describe("isFile", () => {
		test("should return true if path is a file", () => {
			vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);
			expect(Filets.isFile("/test/file.txt")).toBe(true);
		});

		test("should return false if path is not a file", () => {
			vi.mocked(fs.statSync).mockImplementationOnce(() => {
				throw new Error("Path not found");
			});
			expect(Filets.isFile("/test/nonexistent")).toBe(false);
		});
	});

	describe("isDirectory", () => {
		test("should return true if path is a directory", () => {
			vi.mocked(fs.statSync).mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);
			expect(Filets.isDirectory("/test/dir")).toBe(true);
		});

		test("should return false if path is not a directory", () => {
			vi.mocked(fs.statSync).mockImplementationOnce(() => {
				throw new Error("Path not found");
			});
			expect(Filets.isDirectory("/test/nonexistent")).toBe(false);
		});
	});

	describe("getFileName", () => {
		test("should get filename without path", () => {
			const result = Filets.getFileName("/path/to/file.txt");
			expect(result).toBe("file.txt");
		});
	});

	describe("getFileNameWithoutExtension", () => {
		test("should get filename without extension", () => {
			const result = Filets.getFileNameWithoutExtension("/path/to/file.txt");
			expect(result).toBe("file");
		});
	});

	describe("fileExists", () => {
		test("should return true if file exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			expect(Filets.fileExists("/path/to/file")).toBe(true);
		});

		test("should return false if file doesn't exist", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			expect(Filets.fileExists("/path/to/file")).toBe(false);
		});
	});

	describe("directoryExists", () => {
		test("should return true if path exists and is a directory", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => true,
			} as any);
			expect(Filets.directoryExists("/path/to/dir")).toBe(true);
		});

		test("should return false if path is a file", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => false,
			} as any);
			expect(Filets.directoryExists("/path/to/file")).toBe(false);
		});
	});

	describe("getFileSize", () => {
		test("should return size from statSync", () => {
			vi.mocked(fs.statSync).mockReturnValue({ size: 1024 } as any);
			expect(Filets.getFileSize("/path/to/file")).toBe(1024);
		});
	});

	describe("getDirectoryContents", () => {
		test("should return file names in directory", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => true,
			} as any);
			vi.mocked(fs.readdirSync).mockReturnValue([
				"file1.ts",
				"file2.ts",
			] as any);
			expect(Filets.getDirectoryContents("/path/to/dir")).toEqual([
				"file1.ts",
				"file2.ts",
			]);
		});

		test("should return empty array if directory doesn't exist", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			expect(Filets.getDirectoryContents("/path/to/dir")).toEqual([]);
		});
	});

	describe("removeFile", () => {
		test("should unlink if file exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			Filets.removeFile("/path/to/file");
			expect(fs.unlinkSync).toHaveBeenCalledWith("/path/to/file");
			vi.mocked(fs.existsSync).mockClear();
		});

		test("should not unlink if file doesn't exist", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			vi.mocked(fs.unlinkSync).mockClear();
			Filets.removeFile("/path/to/file");
			expect(fs.unlinkSync).not.toHaveBeenCalled();
		});
	});

	describe("removeDirectory", () => {
		test("should remove directory recursively if it exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => true,
			} as any);
			Filets.removeDirectory("/path/to/dir");
			expect(fs.rmSync).toHaveBeenCalledWith("/path/to/dir", {
				recursive: true,
				force: true,
			});
		});
	});

	describe("copyFile", () => {
		test("should call copyFileSync and ensure dest dir exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true); // dest dir exists
			Filets.copyFile("/src/file", "/dest/dir/file");
			expect(fs.copyFileSync).toHaveBeenCalledWith(
				"/src/file",
				"/dest/dir/file",
			);
		});
	});

	describe("path utilities", () => {
		test("getAbsolutePath should resolve path", () => {
			expect(Filets.getAbsolutePath("relative/path")).toBe(
				path.resolve("relative/path"),
			);
		});

		test("getRelativePath should return relative path", () => {
			expect(Filets.getRelativePath("/a/b/c", "/a")).toBe("b/c");
		});

		test("joinPaths should join segments", () => {
			expect(Filets.joinPaths("a", "b", "c")).toBe(path.join("a", "b", "c"));
		});
	});

	describe("moveFile", () => {
		test("should move file and ensure destination directory exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			Filets.moveFile("/src/file", "/dest/dir/file");
			expect(fs.renameSync).toHaveBeenCalledWith("/src/file", "/dest/dir/file");
		});

		test("should throw error if move fails", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.renameSync).mockImplementationOnce(() => {
				throw new Error("Permission denied");
			});
			expect(() => Filets.moveFile("/src/file", "/dest/file")).toThrow(
				"Failed to move file: Failed to rename file: Permission denied",
			);
		});
	});

	describe("renameFile", () => {
		test("should rename file", () => {
			Filets.renameFile("/old/name", "/new/name");
			expect(fs.renameSync).toHaveBeenCalledWith("/old/name", "/new/name");
		});

		test("should throw error if rename fails", () => {
			vi.mocked(fs.renameSync).mockImplementationOnce(() => {
				throw new Error("File not found");
			});
			expect(() => Filets.renameFile("/old", "/new")).toThrow(
				"Failed to rename file: File not found",
			);
		});
	});

	describe("createDirectory", () => {
		test("should create directory if it doesn't exist", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			Filets.createDirectory("/test/dir");
			expect(fs.mkdirSync).toHaveBeenCalledWith("/test/dir", {
				recursive: true,
				mode: 0o755,
			});
		});

		test("should throw error if directory already exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
			expect(() => Filets.createDirectory("/test/dir")).toThrow(
				"Failed to create directory: Directory already exists: /test/dir",
			);
		});

		test("should throw error if mkdir fails", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			vi.mocked(fs.mkdirSync).mockImplementationOnce(() => {
				throw new Error("Permission denied");
			});
			expect(() => Filets.createDirectory("/test/dir")).toThrow(
				"Failed to create directory: Permission denied",
			);
		});
	});

	describe("isEmptyDirectory", () => {
		test("should return true if directory is empty", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => true,
			} as any);
			vi.mocked(fs.readdirSync).mockReturnValue([]);
			expect(Filets.isEmptyDirectory("/test/dir")).toBe(true);
		});

		test("should return false if directory has contents", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => true,
			} as any);
		vi.mocked(fs.readdirSync).mockReturnValue(["file1.txt", "file2.txt"] as any);
			expect(() => Filets.isEmptyDirectory("/test/dir")).toThrow(
				"Failed to check if directory is empty: Directory does not exist: /test/dir",
			);
		});
	});

	describe("renameFile", () => {
	test("should rename file", () => {
		Filets.renameFile("/old/name", "/new/name");
		expect(fs.renameSync).toHaveBeenCalledWith("/old/name", "/new/name");
	});

	test("should throw error if rename fails", () => {
		vi.mocked(fs.renameSync).mockImplementationOnce(() => {
			throw new Error("File not found");
		});
		expect(() => Filets.renameFile("/old", "/new")).toThrow(
			"Failed to rename file: File not found",
		);
	});
});

describe("createDirectory", () => {
	test("should create directory if it doesn't exist", () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		Filets.createDirectory("/test/dir");
		expect(fs.mkdirSync).toHaveBeenCalledWith("/test/dir", {
			recursive: true,
			mode: 0o755,
		});
	});

	test("should throw error if directory already exists", () => {
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
		expect(() => Filets.createDirectory("/test/dir")).toThrow(
			"Failed to create directory: Directory already exists: /test/dir",
		);
	});

	test("should throw error if mkdir fails", () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		vi.mocked(fs.mkdirSync).mockImplementationOnce(() => {
			throw new Error("Permission denied");
		});
		expect(() => Filets.createDirectory("/test/dir")).toThrow(
			"Failed to create directory: Permission denied",
		);
	});
});

describe("isEmptyDirectory", () => {
	test("should return true if directory is empty", () => {
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.statSync).mockReturnValue({
			isDirectory: () => true,
		} as any);
		vi.mocked(fs.readdirSync).mockReturnValue([]);
		expect(Filets.isEmptyDirectory("/test/dir")).toBe(true);
	});

	test("should return false if directory has contents", () => {
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.statSync).mockReturnValue({
			isDirectory: () => true,
		} as any);
		vi.mocked(fs.readdirSync).mockReturnValue(["file1.txt", "file2.txt"] as any);
		expect(Filets.isEmptyDirectory("/test/dir")).toBe(false);
	});

	test("should throw error if directory doesn't exist", () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		expect(() => Filets.isEmptyDirectory("/test/dir")).toThrow(
			"Failed to check if directory is empty: Directory does not exist: /test/dir",
		);
	});
});

describe("copyDirectory", () => {
	test("should copy directory recursively", () => {
		// Mock source directory exists
		vi.mocked(fs.existsSync).mockImplementation((filePath) => {
			if (filePath === "/source" || filePath === "/source/subdir") return true;
			return false;
		});

		// Mock directory stat
		vi.mocked(fs.statSync).mockImplementation((filePath) => {
			if (filePath === "/source") {
				return { isDirectory: () => true } as any;
			}
			if (filePath === "/source/file1.txt") {
				return { isDirectory: () => false } as any;
			}
			if (filePath === "/source/subdir") {
				return { isDirectory: () => true } as any;
			}
			return { isDirectory: () => false } as any;
		});

		vi.mocked(fs.readdirSync).mockImplementation((dirPath: any) => {
			if (dirPath === "/source") {
				return ["file1.txt", "subdir"] as any;
			}
			if (dirPath === "/source/subdir") {
				return [] as any;
			}
			return [] as any;
		});

		Filets.copyDirectory("/source", "/dest");
		expect(fs.copyFileSync).toHaveBeenCalledWith(
			"/source/file1.txt",
			"/dest/file1.txt",
		);
	});

	test("should throw error if source directory doesn't exist", () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		expect(() => Filets.copyDirectory("/source", "/dest")).toThrow(
			"Failed to copy directory: Source directory does not exist: /source",
		);
	});
});

describe("moveDirectory", () => {
	test("should move directory", () => {
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.statSync).mockReturnValue({
			isDirectory: () => true,
		} as any);
		Filets.moveDirectory("/source", "/dest");
		expect(fs.renameSync).toHaveBeenCalledWith("/source", "/dest");
	});

	test("should throw error if source directory doesn't exist", () => {
		vi.mocked(fs.existsSync).mockReturnValue(false);
		expect(() => Filets.moveDirectory("/source", "/dest")).toThrow(
			"Failed to move directory: Source directory does not exist: /source",
		);
	});
});
});
