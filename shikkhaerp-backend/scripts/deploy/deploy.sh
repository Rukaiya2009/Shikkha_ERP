#!/bin/bash

echo "🚀 ShikkhaERP Deployment Script"
echo "================================"

# Stop existing container
echo "Stopping existing application..."
pkill -f shikkhaerp-backend || true

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Build the application
echo "Building application..."
mvn clean package -DskipTests

# Run the application
echo "Starting application..."
nohup java -jar target/shikkhaerp-backend.jar > app.log 2>&1 &

echo "✅ Deployment completed!"
echo "Application running on http://localhost:8080/api"