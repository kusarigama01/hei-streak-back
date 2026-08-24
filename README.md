## Prerequisites
- Node.js 20+
- Docker

## Setup
\`\`\`bash
cp .env.example .env
docker compose up -d
npm install
psql "$DATABASE_URL" -f db/schema.sql
npm run seed
npm run dev
\`\`\`

## Test account
- admin@examhub.local / Admin123!