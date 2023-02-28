FROM node:18.8.0-alpine

LABEL description="This container serves as an entry point for our future Snek Function projects."
LABEL org.opencontainers.image.source="https://github.com/snek-functions/template"
LABEL maintainer="opensource@snek.at"

WORKDIR /app

COPY .sf/ ./.sf
COPY package.json .

RUN yarn install --production

CMD ["sh", "-c", "yarn sf-server"]

EXPOSE 3000

# SPDX-License-Identifier: (EUPL-1.2)
# Copyright © 2022 snek.at
