# Étape 1 : Build avec installation propre
FROM node:18-alpine AS build
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances 
RUN npm install

# Copier le reste du code
COPY . .

# Copier et renommer .env.prod → .env pour production
COPY .env.prod .env

# Étape 2 : Image d'exécution finale
FROM node:18-alpine

# Créer un utilisateur non-root
USER node

# Définir le répertoire de travail
WORKDIR /app

# Copier le code de l'app
COPY --from=build /app /app

# copier node_modules explicitement à part
COPY --from=build /app/node_modules /app/node_modules

# Exposer le port utilisé par Express
EXPOSE 4000

# Lancer l'application
CMD ["node", "server.js"]