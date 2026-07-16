# Servicio HTTP standalone para Railway — renderiza un video corto por
# producto con HyperFrames (heygen-com/hyperframes, OSS Apache-2.0) y avisa
# a BYTE.PE por webhook cuando termina. Ver server.ts y el plan del repo
# principal (services/video-render no es parte del deploy de Vercel).
#
# El setup de Chrome/ffmpeg de acá está calcado del Dockerfile.render
# oficial del propio CLI de HyperFrames
# (packages/cli/src/docker/Dockerfile.render en su repo) — no es una
# receta inventada, es la que ellos mismos usan para renders en Docker.
# Aun así, HyperFrames es un proyecto muy joven (~4 meses): tratar esto
# como experimental hasta probarlo en Railway de verdad.

FROM node:22-bookworm-slim

# Versión de HyperFrames fijada a propósito (no "latest") — proyecto OSS
# joven, un release nuevo podría romper el render sin aviso.
ARG HYPERFRAMES_VERSION=0.7.60

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl unzip ffmpeg chromium \
    libgbm1 libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 \
    libxdamage1 libxrandr2 libcups2 libasound2 libpangocairo-1.0-0 \
    libxshmfence1 libgtk-3-0 \
    fonts-liberation fonts-noto-color-emoji fonts-noto-cjk fonts-noto-core \
    fonts-noto-extra fonts-noto-ui-core fonts-freefont-ttf fonts-dejavu-core \
    fontconfig \
    && rm -rf /var/lib/apt/lists/* && apt-get clean && fc-cache -fv

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CONTAINER=true

# chrome-headless-shell (captura determinística por BeginFrame) — mismo
# paquete y método que usa HyperFrames en su propio Dockerfile de render.
RUN npx --yes @puppeteer/browsers install chrome-headless-shell@stable \
      --path /root/.cache/puppeteer

RUN npm install -g hyperframes@${HYPERFRAMES_VERSION}

# La ruta exacta del binario varía según versión/arch — se resuelve una
# sola vez acá y se guarda en un archivo que lee el arranque, en vez de
# adivinarla a mano.
RUN SHELL_PATH=$(find /root/.cache/puppeteer -name "chrome-headless-shell" -type f | head -1) \
    && test -n "$SHELL_PATH" \
    && echo "$SHELL_PATH" > /chrome-headless-shell-path.txt

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["/bin/sh", "-c", "export PRODUCER_HEADLESS_SHELL_PATH=$(cat /chrome-headless-shell-path.txt) && exec npx tsx src/server.ts"]
