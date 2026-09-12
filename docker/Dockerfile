FROM node:24-alpine

# Diretório de trabalho dentro do contêiner; todos os comandos rodam a partir daqui
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]