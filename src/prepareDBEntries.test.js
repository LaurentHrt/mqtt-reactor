import { describe, it, expect } from "vitest";
import { prepareDBEntries } from "./prepareDBEntries";

describe("prepareDBEntries", () => {
  it("should handle a single standard topic correctly", () => {
    const topic = "zigbee2mqtt/home/livingroom/sensor/temperature";
    const payload = {
      temperature: 22.5,
      humidity: 55,
    };

    const result = prepareDBEntries(topic, payload);
    expect(result).toEqual([
      {
        deviceId: "livingroom-sensor-temperature",
        temperature: 22.5,
        humidity: 55,
      },
    ]);
  });

  describe("dual light", () => {
    it("should handle the dual light topic for sdb correctly", () => {
      const topic = "zigbee2mqtt/home/sdb/lumiere/dual";
      const payload = {
        state_l1: "ON",
        state_l2: "OFF",
        power: 5,
        energy: 10,
      };

      const result = prepareDBEntries(topic, payload);
      expect(result).toEqual([
        {
          deviceId: "sdb-lumiere-plafond",
          state: "ON",
        },
        {
          deviceId: "sdb-lumiere-miroir",
          state: "OFF",
        },
        {
          deviceId: "sdb-lumiere-dual",
          power: 5,
          energy: 10,
        },
      ]);
    });

    it("should handle the dual light topic for cuisine correctly", () => {
      const topic = "zigbee2mqtt/home/cuisine/lumiere/dual";
      const payload = {
        state_l1: "ON",
        state_l2: "OFF",
        power: 5,
        energy: 10,
      };

      const result = prepareDBEntries(topic, payload);
      expect(result).toEqual([
        {
          deviceId: "cuisine-lumiere-planDeTravail",
          state: "ON",
        },
        {
          deviceId: "cuisine-lumiere-plafond",
          state: "OFF",
        },
        {
          deviceId: "cuisine-lumiere-dual",
          power: 5,
          energy: 10,
        },
      ]);
    });
  });

  it("should return an empty array for an invalid topic", () => {
    const topic = "invalid/topic/structure";
    const payload = {
      action: null,
    };

    const result = prepareDBEntries(topic, payload);
    expect(result).toEqual([]);
  });

  it("should return an empty array for an invalid topic", () => {
    const topic = "invalid/topic/structure/invalid/topic/structure";
    const payload = {
      action: null,
    };

    const result = prepareDBEntries(topic, payload);
    expect(result).toEqual([]);
  });
});
