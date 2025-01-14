import { test, expect } from "vitest";
import { isDuplicate } from "./deduplication";

test("A button is never considered duplicate", () => {
  const result = isDuplicate("test/bouton/test", '{"value": 1}');
  const result2 = isDuplicate("test/bouton/test", '{"value": 1}');
  const result3 = isDuplicate("test/bouton/test", '{"value": 2}');

  expect(result).toBe(false);
  expect(result2).toBe(false);
  expect(result3).toBe(false);
});

test("Simple duplicate", () => {
  const result = isDuplicate("test/device/test", '{"value": 1}');
  const result2 = isDuplicate("test/device/test", '{"value": 1}');
  const result3 = isDuplicate("test/device/test", '{"value": 2}');
  const result4 = isDuplicate("test/device/test", '{"value": 1}');
  const result5 = isDuplicate("test/device/test", '{"value": 1}');

  expect(result).toBe(false);
  expect(result2).toBe(true);
  expect(result3).toBe(false);
  expect(result4).toBe(false);
  expect(result5).toBe(true);
});
