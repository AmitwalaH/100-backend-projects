
FROM node:20

WORKDIR /usr/src/app

# Copy Dependencies
COPY package*.json ./

# Install Dependencies
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]