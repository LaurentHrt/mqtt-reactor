export function anythingStrategy(topic, payload) {
  const [, ...rest] = topic.split("/");
  const deviceId = rest.join("-");
  return [
    {
      deviceId,
      ...payload,
    },
  ];
}
