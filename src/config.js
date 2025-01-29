const config = {
  useSSO: process.env.USE_SSO === "true",
  ssoProfile: process.env.SSO_PROFILE || "",
  awsRegion: "eu-west-3",
  tableName: process.env.DYNAMODB_TABLENAME || "dev-HomeDeviceData",
  mqtt: {
    host: process.env.MQTT_HOST || "localhost",
    port: process.env.MQTT_PORT || 1883,
    username: process.env.MQTT_USERNAME || "mosquitto",
    topics:
      process.env.MQTT_TOPICS.split(",") || "zigbee2mqtt/home/#".split(","),
  },
  dbStrategy: process.env.DB_STRATEGY || "none",
  dbDirectory: process.env.DB_DIRECTORY || "database",
  dbFilename: process.env.DB_FILENAME || "db.txt",
};

export default config;
