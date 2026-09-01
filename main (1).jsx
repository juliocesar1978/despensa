FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p /app/data /app/uploads
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm start"]
