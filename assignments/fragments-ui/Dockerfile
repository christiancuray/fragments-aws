# ----- Step 1: Dependencies -----
FROM node:23.1.0-bullseye@sha256:2317ac63e15480ce904d544720da29dc3a67030110302052307c97818dc8ebe0 AS dependencies

# reduce npm log/spam when installing packages in Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# set working directory
WORKDIR /site

# copy package.json and package-lock.json files
COPY package*.json ./

# install node dependencies
RUN npm ci

# ----- Step 2: Build -----
FROM node:23.1.0-bullseye@sha256:2317ac63e15480ce904d544720da29dc3a67030110302052307c97818dc8ebe0 AS build

# set working directory
WORKDIR /site

# copy all files from dependencies stage
COPY --from=dependencies /site ./
COPY . . 

# build the site
RUN npm run build

# ----- Step 3: Deploy ----- 
FROM nginx:1.22.0-alpine@sha256:addd3bf05ec3c69ef3e8f0021ce1ca98e0eb21117b97ab8b64127e3ff6e444ec AS deploy

# nginx configuration
COPY --from=build /site/dist /usr/share/nginx/html

EXPOSE 80

# health check
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8080/ || exit 1

