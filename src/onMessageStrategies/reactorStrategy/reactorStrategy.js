import { reactorConfig } from "../../config.js";

let enabled;

export const reactorStrategy = (mqttClient) => {
  return {
    onMessage: (topic, message) => {
      const payload = JSON.parse(message.toString());
      const { subTopic, pubTopic, pubSdbLumiereAuto } = reactorConfig;

      if (topic === pubSdbLumiereAuto) {
        if (payload.state === "ON") {
          console.log("Reactor strategy: sdb lumiere auto ON");
          enabled = true;
        }
        if (payload.state === "OFF") {
          console.log("Reactor strategy: sdb lumiere auto OFF");
          enabled = false;
        }
        return;
      }

      if (!enabled) {
        return;
      }

      if (topic === subTopic && payload.occupancy) {
        const payload = { state_l1: "ON" };
        mqttClient.publish(pubTopic, JSON.stringify(payload));
      }
    },
    init: () => {
      enabled = true;
      const { subTopic, pubSdbLumiereAuto } = reactorConfig;
      mqttClient.subscribe([subTopic, pubSdbLumiereAuto], (err) => {
        if (err) {
          console.error(
            "Reactor strategy: Failed to subscribe to MQTT topics:",
            err,
          );
        } else {
          console.log(
            `reactor strategy: Subscribed to MQTT topics: ${pubSdbLumiereAuto},${subTopic}`,
          );
        }
      });

      console.log("Reactor strategy initialized");
    },
    end: () => {
      console.log("End Reactor strategy");
    },
  };
};
