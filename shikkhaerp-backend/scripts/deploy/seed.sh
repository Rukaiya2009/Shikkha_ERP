#!/bin/bash

echo="🌱 Seeding Database"
echo "=================="

export PGPASSWORD='Farhana251@'

# Run seed files
psql -U postgres -h localhost -d shikkhaerp -f scripts/db/seed/01_users.sql
psql -U postgres -h localhost -d shikkhaerp -f scripts/db/seed/02_students.sql
psql -U postgres -h localhost -d shikkhaerp -f scripts/db/seed/03_teachers.sql

echo "✅ Seed data inserted successfully!"