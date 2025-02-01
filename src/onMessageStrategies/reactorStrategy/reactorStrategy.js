import config from "../../config.js";

export const reactorStrategy = (mqttClient) => {
  return {
    onMessage: (topic, message) => {
      const payload = JSON.parse(message.toString());
      if (topic === config.reactor.subTopic && payload.occupancy) {
        mqttClient.publish(
          `${config.reactor.pubTopic}/set`,
          '{"state_l1": "ON"}',
        );
      }
    },
    init: () => {
      console.log("reactorStrategy initialized");
    },
    end: () => {
      console.log("End reactorStrategy");
    },
  };
};
