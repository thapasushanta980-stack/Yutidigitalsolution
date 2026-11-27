FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN npm ci --include=dev && npm run db:generate && npm run build:api && npm run build:admin
EXPOSE 4403
CMD ["node","deploy/cms/start.mjs"]
