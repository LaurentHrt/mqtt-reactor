import { config } from "../../config.js";

let enabled;

export const reactorStrategy = (mqttClient) => {
  return {
    onMessage: (topic, message) => {
      const payload = JSON.parse(message.toString());

      if (topic === "mqttreactor/sdb/lumiereauto/set") {
        if (payload.state === "ON") {
          console.log("Reactor strategy: sdb lumiere auto ON");
          enabled = true;
        }
        if (payload.state === "OFF") {
          console.log("Reactor strategy: sdb lumiere auto OFF");
          enabled = false;
        }
      }

      if (!enabled) {
        return;
      }

      if (topic === config.reactor.subTopic && payload.occupancy) {
        mqttClient.publish(
          `${config.reactor.pubTopic}/set`,
          '{"state_l1": "ON"}',
        );
      }
    },
    init: () => {
      enabled = true;
      mqttClient.subscribe(
        [config.reactor.subTopic, "mqttreactor/sdb/lumiereauto/set"],
        (err) => {
          if (err) {
            console.error(
              "Reactor strategy: Failed to subscribe to MQTT topics:",
              err,
            );
          } else {
            console.log(
              `reactor strategy: Subscribed to MQTT topics: mqttreactor/sdb/lumiereauto/set,${config.reactor.subTopic}`,
            );
          }
        },
      );

      console.log("Reactor strategy initialized");
    },
    end: () => {
      mqttClient.end();
      console.log("End Reactor strategy");
    },
  };
};
