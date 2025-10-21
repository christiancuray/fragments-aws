# Docker file to build a fragment image

# use node 23.1.0 as base image
FROM node:23.1.0

LABEL maintainer="Christian Daryl Curay"
LABEL description="Fragments node.js microservice"

# use default 8080 port 
ENV PORT=8080

# reduce npm log/spam when installing packages in Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# disable colour when running npm in Docker
ENV NPM_CONFIG_COLOR=false

# use /app as working directory
WORKDIR /app

# copy package.json and package-lock.json files to /app dir
COPY package*.json /app/

# install node dependencies
RUN npm install

# copy all files to /app dir
COPY . /app/

# copy HTPASSWD file to /app dir
COPY ./tests/.htpasswd /app/tests/.htpasswd

# start the container by running the server in CMD
CMD npm start

# expose port 8080
EXPOSE 8080