# Utiliser une image Python officielle légère
FROM python:3.9-slim-bullseye

# Créer un utilisateur non-root sécurisé
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source dans le conteneur
COPY . .
COPY .env .env

# Copier le vector_store contenant les index FAISS
COPY vector_store/ ./vector_store

# Donner les permissions à l’utilisateur non-root
RUN chown -R appuser:appgroup /app

# Passer à l’utilisateur non-root
USER appuser

# Exposer le port de l'application Flask 
EXPOSE 5000

# Démarrer l'application Flask
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
