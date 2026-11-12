# Étape 1 : Build de l'application React
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Injecter la configuration de production
COPY .env.prod .env

# Build de l'application React (injecte les REACT_APP_*)
RUN npm run build

# Étape 2 : Image minimale pour servir la build
FROM node:18-alpine

# Installer un serveur statique pour servir la build
RUN npm install -g serve

WORKDIR /app

# Copier uniquement le build React
COPY --from=build /app/build ./build

# Utilisateur non-root
USER node

# Exposer le port 3000
EXPOSE 3000

# Lancer le serveur
CMD ["serve", "-s", "build", "-l", "3000"]
