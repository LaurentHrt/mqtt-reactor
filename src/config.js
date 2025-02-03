export const appConfig = {
  mqttBaseTopics:
    process.env.MQTT_BASE_TOPICS?.split(",") || "zigbee2mqtt/home/#".split(","),
  onMessageStrategies: process.env.ON_MESSAGE_STRATEGIES?.split(",") || [],
};

export const mqttBrokerConfig = {
  host: process.env.MQTT_BROKER_HOST || "localhost",
  port: process.env.MQTT_BROKER_PORT || 1883,
  username: process.env.MQTT_BROKER_USERNAME || "mosquitto",
};

export const dynamoDBConfig = {
  useSSO: process.env.DYNAMODB_USE_SSO === "true",
  ssoProfile: process.env.DYNAMODB_SSO_PROFILE || "",
  awsRegion: process.env.DYNAMODB_REGION || "eu-west-3",
  tableName: process.env.DYNAMODB_TABLENAME || "dev-HomeDeviceData",
};

export const fileSystemConfig = {
  dbDirectory: process.env.FILESYSTEM_DIRECTORY || "database",
  dbFilename: process.env.FILESYSTEM_FILENAME || "db.txt",
};

export const reactorConfig = {
  subTopic: process.env.REACTOR_SUB_TOPIC || "",
  pubTopic: process.env.REACTOR_PUB_TOPIC || "",
  pubSdbLumiereAuto: process.env.REACTOR_PUB_SDB_LUMIEREAUTO || "",
};
