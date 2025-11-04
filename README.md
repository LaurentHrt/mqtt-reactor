# mqtt-reactor

A node service that listen to a MQTT topic and react by doing things (save in dynamoDB, in file systeme, etc...)

## Local development

1. `npm install`
2. `cp .env.example .env` then adjust
3. `npm run start` or `npm run start:dev`

## Deployment

From remote, using .deploy.env:
`./deploy.sh`

Directly on the machine:
`sudo systemctl restart mqtt-reactor.service`

## Logs
`sudo journalctl -u mqtt-reactor -f`
