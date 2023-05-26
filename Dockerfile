# Basics
FROM node:19.2-alpine
WORKDIR /app

# Update the project
RUN apk upgrade --update --no-cache;
RUN npm i -g grpc-tools

# Configure the user
RUN mkdir logs
RUN chown -R node /app;
USER node

# Get and install the dependencies
COPY --chown=node package.json ./
RUN yarn install --production

# Copy the project to the container
COPY --chown=node tsconfig.json ./
COPY --chown=node certs ./certs
COPY --chown=node src ./src

# Run the project
RUN yarn run build
CMD yarn run start:prod
