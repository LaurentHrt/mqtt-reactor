import { connect } from "mqtt";
import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { initializeMQTTClient } from "./mqtt";

vi.mock("mqtt", () => {
  const Client = vi.fn();
  Client.on = vi.fn();
  Client.end = vi.fn();
  Client.subscribe = vi.fn();
  return {
    connect: vi.fn().mockImplementation(() => Client),
  };
});

describe("mqtt", () => {
  let mqttClient;
  let onMessageMock;
  const config = {
    mqtt: {
      host: "myHost",
      port: 1884,
      username: "myUser",
      topic: "myTopic",
    },
  };

  beforeEach(() => {
    onMessageMock = vi.fn();
    mqttClient = initializeMQTTClient(config, connect, onMessageMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call connect", () => {
    const url = `mqtt://${config.mqtt.host}:${config.mqtt.port}`;
    expect(connect).toHaveBeenCalledOnce();
    expect(connect).toHaveBeenCalledWith(url, {
      username: config.mqtt.username,
    });
  });

  it("should call on 3 times with good parameters", () => {
    expect(mqttClient.on).toHaveBeenCalledTimes(3);
    expect(mqttClient.on).toHaveBeenNthCalledWith(
      1,
      "connect",
      expect.any(Function),
    );
    expect(mqttClient.on).toHaveBeenNthCalledWith(2, "message", onMessageMock);
    expect(mqttClient.on).toHaveBeenNthCalledWith(
      3,
      "error",
      expect.any(Function),
    );
  });

  it("should subscribe to the topic", () => {
    expect(mqttClient.on).toHaveBeenNthCalledWith(
      1,
      "connect",
      expect.any(Function),
    );
    expect(mqttClient.subscribe).toHaveBeenCalledOnce();
    expect(mqttClient.subscribe).toHaveBeenCalledWith(
      config.mqtt.topic,
      expect.any(Function),
    );
  });
});
