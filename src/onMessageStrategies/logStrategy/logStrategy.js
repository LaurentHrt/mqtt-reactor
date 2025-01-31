export const logStrategy = {
  onMessage: (topic, message) => {
    console.log("Message on topic: ", topic);
    console.log("with content: ", JSON.parse(message.toString()));
  },
  init: () => {
    console.log("LogStrategy initialized");
  },
  end: () => {
    console.log("End LogStrategy");
  },
};
