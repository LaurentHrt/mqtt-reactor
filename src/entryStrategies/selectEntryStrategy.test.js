import { describe, it, expect, vi, afterEach } from "vitest";
import { selectEntryStrategy } from "./selectEntryStrategy.js";
import { zigbeeStrategy } from "./zigbeeStrategy";
import { pingStrategy } from "./pingStrategy";

vi.mock("./pingStrategy.js", () => {
  return { pingStrategy: vi.fn() };
});

vi.mock("./zigbeeStrategy.js", () => {
  return { zigbeeStrategy: vi.fn() };
});

describe("selectEntryStrategy", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it("should return an empty strategy for unknown topic", () => {
    const result = selectEntryStrategy("unknown");
    expect(result).toEqual(expect.any(Function));
  });
  it("should return zigbeeStrategy", () => {
    const result = selectEntryStrategy("zigbee2mqtt/home/test");
    expect(result).toEqual(zigbeeStrategy);
  });
  it("should return pingStrategy", () => {
    const result = selectEntryStrategy("ping2mqtt/test");
    expect(result).toEqual(pingStrategy);
  });
});
