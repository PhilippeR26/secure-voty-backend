# Étape 1 : Builder – compile Scarb et ton projet Cairo
FROM rust:1.85-bookworm AS builder 

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates unzip tar \
    && rm -rf /var/lib/apt/lists/*

# Télécharge la dernière version stable de Scarb (remplace la version par la plus récente si besoin)
# Vérifie sur https://github.com/software-mansion/scarb/releases pour le tag exact (ex. v2.15.0 ou v2.16.0)
RUN curl -L https://github.com/software-mansion/scarb/releases/download/v2.15.0/scarb-v2.15.0-x86_64-unknown-linux-gnu.tar.gz \
    -o scarb.tar.gz \
    && tar -xzf scarb.tar.gz -C /usr/local --strip-components=1 \
    && rm scarb.tar.gz

# Vérifie installation
RUN scarb --version

# Copie et build ton projet Cairo (optimise cache)
WORKDIR /app/vote_private
COPY vote_private/Scarb.toml vote_private/Scarb.lock* ./
COPY vote_private/src ./src
RUN scarb build

# Étape 2 : Image runtime légère
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Réinstalle Scarb de la même façon (pour runtime)
RUN curl -L https://github.com/software-mansion/scarb/releases/download/v2.15.0/scarb-v2.15.0-x86_64-unknown-linux-gnu.tar.gz \
    -o scarb.tar.gz \
    && tar -xzf scarb.tar.gz -C /usr/local --strip-components=1 \
    && rm scarb.tar.gz

WORKDIR /app

COPY --from=builder /app/vote_private /app/vote_private

COPY server.ts package.json package-lock.json* ./

RUN npm install

EXPOSE 4000
CMD ["npm", "start"]