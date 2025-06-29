FROM node:20-alpine

RUN apk add bash git python3 make tini && npm i -g typescript

ENV NODE_ENV=dev

USER node
COPY --chown=node:node yarn.lock /opt/services/ew-demo/
COPY --chown=node:node package.json /opt/services/ew-demo/

WORKDIR /opt/services/ew-demo
RUN yarn install --production=false --frozen-lockfile
COPY  --chown=node:node *.json *.ts /opt/services/ew-demo/
COPY  --chown=node:node src/ /opt/services/ew-demo/src/

# SET ARGS, LABELS, ENVS
ARG IMAGE_TAG
ARG SERVICE_NAME
ENV DD_SERVICE="${SERVICE_NAME}"
ENV DD_VERSION="${IMAGE_TAG}"

# BUILD
RUN yarn build && yarn cache clean

ENTRYPOINT ["/sbin/tini",  "-g", "--", "yarn", "run", "start"]
