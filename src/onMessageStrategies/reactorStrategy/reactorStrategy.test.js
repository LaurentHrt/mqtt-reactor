import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { connect } from "mqtt";
import { reactorStrategy } from "./reactorStrategy.js";
import { initializeMQTTClient } from "../../mqtt.js";

vi.mock("mqtt", () => {
  const Client = vi.fn();
  Client.on = vi.fn();
  Client.end = vi.fn();
  Client.subscribe = vi.fn();
  Client.publish = vi.fn();
  return {
    connect: vi.fn().mockImplementation(() => Client),
  };
});

vi.mock("../../config.js", () => {
  const mqttBrokerConfig = {
    host: "myHost",
    port: 1884,
    username: "myUser",
    topics: ["myTopic"],
  };
  const reactorConfig = {
    subTopic: "subTopic",
    pubTopic: "pubTopic",
    pubSdbLumiereAuto: "pubSdbLumiereAuto",
  };
  return { reactorConfig, mqttBrokerConfig };
});

describe("reactorStrategy", () => {
  let mqttClient;

  beforeEach(() => {
    mqttClient = initializeMQTTClient(connect);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a valied strategy object", () => {
    const strategy = reactorStrategy(mqttClient);
    const expected = {
      end: expect.any(Function),
      init: expect.any(Function),
      onMessage: expect.any(Function),
    };
    expect(strategy).toEqual(expected);
  });

  it("should subscribe in init", () => {
    reactorStrategy(mqttClient).init();
    expect(mqttClient.subscribe).toHaveBeenCalled();
  });

  it("should publish onMessage", () => {
    const reactorConfig = {
      subTopic: "subTopic",
      pubTopic: "pubTopic",
      pubSdbLumiereAuto: "pubSdbLumiereAuto",
    };
    const strategy = reactorStrategy(mqttClient);
    strategy.onMessage(
      reactorConfig.subTopic,
      JSON.stringify({ occupancy: true }),
    );
    expect(mqttClient.publish).toHaveBeenCalled();
  });
});
