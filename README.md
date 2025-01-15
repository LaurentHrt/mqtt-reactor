# mqtt2dynamodb

A node service that listen to a MQTT topic and save the messages to AWS DynamoDB.

## Features

- Listen to a MQTT topic
- Write every message in DynamoDB
- Avoid writing in DynamoDB if the message is the same as the previous one, based on a list of keys

## Prerequisites

- A MQTT Broker is running (https://mosquitto.org/)
- Authenticated in AWS either with SSO or with Access Keys as environment variables
- A table is created in AWS DynamoDB

## Installation

1. `npm install`
2. `cp .env.example .env` then adjust
3. `npm run start` or `npm run start:dev`

## TODO

- Save state of dual switch in 3 ways: state_l1 (with just state), state_l2, dual (with energy, power, state...). So there will be 3 entries in db for example: room-light-place1, room-light-place2, room-light-dual
- Add end to end tests
