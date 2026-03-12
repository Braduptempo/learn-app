FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Kopieer de rest van je code
COPY . .

# Stel de poort in die Vite gebruikt (standaard 5173)
EXPOSE 5173

# Start de ontwikkelserver
CMD ["npm", "run", "dev", "--", "--host"]