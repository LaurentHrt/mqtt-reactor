import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { processMessage } from "./processMessage";

describe("processMessage", () => {
  let onMessageMock;
  let prepareMessageMock;

  beforeEach(() => {
    onMessageMock = vi.fn();
    prepareMessageMock = vi.fn();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should prepareEntries and write a correct message", () => {
    const topic = "zigbee2mqtt/home/sdb/lumiere/location";
    const message = Buffer.from(
      '{ "state_l1": "OFF", "state_l2": "OFF", "power": 5 }',
    );
    const dataToWrite = [
      { deviceId: "sdb-lumiere-plafond", state: "OFF" },
      { deviceId: "sdb-lumiere-miroir", state: "OFF" },
      { deviceId: "sdb-lumiere-dual", power: 5 },
    ];

    prepareMessageMock.mockImplementationOnce(() => {
      return dataToWrite;
    });
    processMessage(topic, message, prepareMessageMock, onMessageMock);

    expect(prepareMessageMock).toHaveBeenCalledOnce();
    expect(onMessageMock).toHaveBeenCalledOnce();
    expect(onMessageMock).toHaveBeenCalledWith(dataToWrite);
  });

  it("should not write an empty message", () => {
    const topic = "zigbee2mqtt/home/sdb/lumiere/location";
    const message = "{}";
    const dataToWrite = [];

    prepareMessageMock.mockImplementationOnce(() => {
      return dataToWrite;
    });

    processMessage(topic, message, prepareMessageMock, onMessageMock);

    expect(onMessageMock).not.toHaveBeenCalled();
  });

  it("should not write an empty payload", () => {
    const topic = "zigbee2mqtt/home/sdb/lumiere/location";
    const message = "{}";
    processMessage(topic, message, prepareMessageMock, onMessageMock);

    expect(onMessageMock).not.toHaveBeenCalled();
  });

  it("should not write bad JSON", () => {
    const topic = "zigbee2mqtt/home/sdb/lumiere/location";
    const message = "BAD JSON";

    processMessage(topic, message, prepareMessageMock, onMessageMock);
    expect(onMessageMock).not.toHaveBeenCalled();
  });
});
