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
	readdirSync: vi.fn(),
	statSync: vi.fn(),
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
				"Failed to write JSON file: Disk full",
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
			// biome-ignore lint/suspicious/noExplicitAny: mocking fs.Stats
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => true,
			} as any);
			expect(Filets.directoryExists("/path/to/dir")).toBe(true);
		});

		test("should return false if path is a file", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			// biome-ignore lint/suspicious/noExplicitAny: mocking fs.Stats
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => false,
			} as any);
			expect(Filets.directoryExists("/path/to/file")).toBe(false);
		});
	});

	describe("getFileSize", () => {
		test("should return size from statSync", () => {
			// biome-ignore lint/suspicious/noExplicitAny: mocking fs.Stats
			vi.mocked(fs.statSync).mockReturnValue({ size: 1024 } as any);
			expect(Filets.getFileSize("/path/to/file")).toBe(1024);
		});
	});

	describe("getDirectoryContents", () => {
		test("should return file names in directory", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			// biome-ignore lint/suspicious/noExplicitAny: mocking fs.Stats
			vi.mocked(fs.statSync).mockReturnValue({
				isDirectory: () => true,
			} as any);
			// biome-ignore lint/suspicious/noExplicitAny: mocking readdirSync return
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
		});

		test("should not unlink if file doesn't exist", () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			Filets.removeFile("/path/to/file");
			expect(fs.unlinkSync).not.toHaveBeenCalled();
		});
	});

	describe("removeDirectory", () => {
		test("should remove directory recursively if it exists", () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			// biome-ignore lint/suspicious/noExplicitAny: mocking fs.Stats
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
});
