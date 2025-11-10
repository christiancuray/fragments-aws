# Docker file to build a fragment image

# -------- Stage 1: Dependencies -----
FROM node:23.1.0-alpine3.19@sha256:befa90e43121e3c38c1e6bc32dcbb3c4bf5a0a66626355d893fc5f7a51653a59 AS dependencies

LABEL maintainer="Christian Daryl Curay"
LABEL description="Fragments node.js microservice"

# environment variables
ENV PORT=8080

# reduce npm log/spam when installing packages in Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# disable colour when running npm in Docker
ENV NPM_CONFIG_COLOR=false

# use /app as working directory
WORKDIR /app

# copy package.json and package-lock.json files to /app dir
COPY package*.json ./

# install node dependencies
RUN npm ci 

# copy all files to /app dir
COPY . ./

# --------- Stage 2: Production ---------
# using node 16.14 alpine 3.14 
FROM node:23.1.0-alpine3.19@sha256:befa90e43121e3c38c1e6bc32dcbb3c4bf5a0a66626355d893fc5f7a51653a59 AS production

# environment variables
ENV NODE_ENV=production
ENV PORT=8080

# use /app as working directory
WORKDIR /app

# Install tini and curl in the production image
RUN apk --no-cache add tini=0.19.0-r2 curl=8.5.0-r0
# COPY node modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# copy all files from dependencies stage to production stage
COPY --from=dependencies /app ./

# copy HTPASSWD file to /app dir
COPY --from=dependencies /app/tests/.htpasswd /app/tests/.htpasswd


# change ownership of /app dir to non-root user 'node'
COPY --from=dependencies --chown=node:node /app /app

# use non-root user to run the application for better security
USER node

# Use tini as the init process
ENTRYPOINT ["/sbin/tini", "--"]

# expose port 8080
EXPOSE 8080

# start the container by running the server in CMD
CMD ["npm", "start"]

# Health check after the app starts
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1