FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git openssh-client openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# Pinned GitHub host keys (https://api.github.com/meta) for the CMS publisher's strict ssh checks.
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh && printf '%s\n' \
 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl' \
 'github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=' > /root/.ssh/known_hosts && chmod 644 /root/.ssh/known_hosts
WORKDIR /app
COPY . .
RUN npm ci --include=dev && npm run db:generate && npm run build:api && npm run build:admin
EXPOSE 4403
CMD ["node","deploy/cms/start.mjs"]
