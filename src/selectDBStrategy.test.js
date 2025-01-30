import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { selectDBStrategy } from "./selectDBStrategy";
import { vi } from "vitest";
import { initializeDynamoDB } from "./dynamodb.js";
import { initializeFileSystem } from "./fileSystem.js";

vi.mock("./dynamodb.js", async (importOriginal) => {
  return {
    initializeDynamoDB: vi.fn().mockImplementation(() => {
      return { coucou: "test" };
    }),
  };
});

vi.mock("./fileSystem.js", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    initilizeFileSystem: () => {
      return {};
    },
  };
});

describe("selectDBStrategy", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a valid strategy object", async () => {
    vi.mock("./config.js", async (importOriginal) => {
      const mod = await importOriginal();
      mod.default.dbStrategy = "anyStrategy";
      return {
        ...mod,
      };
    });

    const strategy = await selectDBStrategy();
    expect(strategy).toStrictEqual({
      end: expect.any(Function),
      write: expect.any(Function),
    });
  });

  it("should return a dynamoDB strategy", async () => {
    vi.mock("./config.js", async (importOriginal) => {
      const mod = await importOriginal();
      mod.default.dbStrategy = "dynamoDB";
      return {
        ...mod,
      };
    });

    const strategy = await selectDBStrategy();
    strategy.write();
    console.log(strategy);
    expect(initializeDynamoDB).toHaveBeenCalled();
  });
});
