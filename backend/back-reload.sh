#!/bin/bash

#docker stop backend-api-1 backend-db-1
docker rm backend-api-1 backend-db-1
docker rmi backend-api
docker volume rm backend_postgres

docker-compose up -d