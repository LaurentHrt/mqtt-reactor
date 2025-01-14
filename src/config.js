import "dotenv/config";

const config = {
  useSSO: process.env.USE_SSO === "true",
  ssoProfile: process.env.SSO_PROFILE || "",
  awsRegion: "eu-west-3",
  tableName: process.env.DYNAMODB_TABLENAME || "dev-HomeDeviceData",
  mqtt: {
    host: process.env.MQTT_HOST || "localhost",
    port: process.env.MQTT_PORT || 1883,
    username: process.env.MQTT_USERNAME || "mosquitto",
    topic: process.env.MQTT_TOPIC || "zigbee2mqtt/home/#",
  },
};

export default config;
