#!/bin/bash

# Create database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE expenditure;" || true

# Run the SQL setup script
sudo -u postgres psql -d expenditure -f setup.sql

echo "Database setup completed!" 