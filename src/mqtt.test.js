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

vi.mock("./config.js", () => {
  const mqttBrokerConfig = {
    host: "myHost",
    port: 1884,
    username: "myUser",
    topics: ["myTopic"],
  };
  return { mqttBrokerConfig };
});

describe("mqtt", () => {
  let mqttClient;
  let onMessageMock;

  beforeEach(() => {
    onMessageMock = vi.fn();
    mqttClient = initializeMQTTClient(connect);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should connect to the broker", () => {
    const mqttBrokerConfig = {
      host: "myHost",
      port: 1884,
      username: "myUser",
    };
    const url = `mqtt://${mqttBrokerConfig.host}:${mqttBrokerConfig.port}`;
    expect(connect).toHaveBeenCalledOnce();
    expect(connect).toHaveBeenCalledWith(url, {
      username: mqttBrokerConfig.username,
    });
  });

  it("should register 'connect' and 'error' events", () => {
    expect(mqttClient.on).toHaveBeenCalledTimes(2);
    expect(mqttClient.on).toHaveBeenNthCalledWith(
      1,
      "connect",
      expect.any(Function),
    );
    expect(mqttClient.on).toHaveBeenNthCalledWith(
      2,
      "error",
      expect.any(Function),
    );
  });
});
