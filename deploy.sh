#!/bin/bash

# Load environment variables from .deploy.env file
if [ -f .deploy.env ]; then
  export $(grep -v '^#' '.deploy.env' | xargs)
else
  echo ".deploy.env file not found! Deployment aborted."
  exit 1
fi

echo "Starting deployment to $USER@$HOST..."

echo "Running tests locally..."
npm run test 

if [ $? -ne 0 ]; then
  echo "Tests failed. Deployment aborted."
  exit 1
fi

echo "ssh $USER@$HOST -i $KEY_PATH"

ssh $USER@$HOST -i $KEY_PATH << EOF
  set -e

  cd $APP_DIR

  echo "Pulling latest changes..."
  git pull origin main

  echo "Installing dependencies..."
  npm install

  echo "Running tests on server..."
  npm run test || { echo "Tests failed on server. Deployment aborted."; exit 1; }

  echo "Restarting service..."
  sudo systemctl restart $SERVICE_NAME

  echo "Deployment complete!"
EOF
