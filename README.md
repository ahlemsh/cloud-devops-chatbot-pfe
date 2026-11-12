# cloud-devops-chatbot-pfe

> Chatbot d'entreprise basé sur RAG (Retrieval-Augmented Generation), déployé sur Azure Stack via une chaîne DevOps complète : CI/CD Azure DevOps, Kubernetes, Terraform et Ansible.

Projet de Fin d'Études — Architecture microservices cloud-native.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Utilisateur                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │   Frontend (React 19)   │
         │   Service K8s NodePort  │
         └────────────┬────────────┘
                      │ HTTP
         ┌────────────▼────────────┐
         │  Backend (Node.js /     │
         │  Express + MongoDB)     │
         │  Service K8s NodePort   │
         └────────────┬────────────┘
                      │ HTTP
         ┌────────────▼────────────┐
         │  Modèle IA (Flask +     │
         │  LangChain + LLama3)    │
         │  Déployé sur VM dédiée  │
         │  via Ansible            │
         └─────────────────────────┘

Infrastructure Azure Stack
├── AKS (frontend + backend)
├── VM IA dédiée (modèle Flask + FAISS)
├── VM MongoDB
└── FortiGate (firewall / NAT)
```

---

## Stack Technique

### Application
| Composant | Technologies |
|-----------|-------------|
| Frontend | React 19, Axios, React Testing Library, Cypress |
| Backend | Node.js, Express 4, MongoDB, Mongoose, UUID |
| Modèle IA | Python, Flask, LangChain, LLama3-70b (Groq), FAISS, Google Generative AI |
| Monitoring | Prometheus (`prom-client`, `prometheus_flask_exporter`) |

### DevOps & Infrastructure
| Composant | Technologies |
|-----------|-------------|
| Conteneurisation | Docker (multi-stage builds) |
| Orchestration | Kubernetes (AKS — Azure Stack) |
| IaC | Terraform (provider `azurestack`) |
| Configuration | Ansible |
| CI/CD | Azure DevOps Pipelines |
| Qualité code | SonarQube (3 projets) |
| Sécurité images | Trivy |
| Registry | Nexus Repository |

---

## Fonctionnalités

- **Base de connaissance** : chargement d'un fichier texte via `/upload`, découpage en chunks, génération d'embeddings (Google AI) et stockage dans FAISS
- **RAG conversationnel** : retriever FAISS + historique de conversation + LLama3-70b via Groq
- **Gestion des sessions** : sessions UUID persistées dans MongoDB, nommées automatiquement par extraction NLP (mots-clés avec `natural` + `stopword`)
- **Interface utilisateur** : sidebar avec FAQ, historique des sessions, indicateur de frappe animé, suppression de session, bouton "New Chat"
- **Métriques** : endpoints `/metrics` sur backend et modèle pour Prometheus

---

## Structure du Projet

```
cloud-devops-chatbot-pfe/
├── chatbot-backend/          # API Node.js + Express + MongoDB
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── tests/
│   └── Dockerfile
├── chatbot-frontend/         # Interface React
│   ├── src/
│   │   ├── components/
│   │   └── tests/
│   └── Dockerfile
├── chatbot-model/            # Serveur Flask + LangChain + FAISS
│   ├── app.py
│   ├── test_app.py
│   ├── requirements.txt
│   └── Dockerfile
├── k8s/                      # Manifestes Kubernetes + Ansible
│   ├── backend/
│   ├── frontend/
│   └── ansible/
├── terraform/                # Infrastructure Azure Stack (IaC)
├── azure-pipelines.yml       # Pipeline CD : K8s + Ansible deploy
├── azure-pipelines-ci.yml    # Pipeline CI : tests + SonarQube + Trivy + Nexus
└── rfc.txt                   # Base de connaissance du chatbot
```

---

## Prérequis

- Node.js 18+
- Python 3.9+
- MongoDB (local ou Atlas)
- Docker
- Clés API : [Google Generative AI](https://aistudio.google.com/) et [Groq](https://console.groq.com/)

---

## Installation locale

### 1. Cloner le repo

```bash
git clone https://github.com/<your-username>/cloud-devops-chatbot-pfe.git
cd cloud-devops-chatbot-pfe
```

### 2. Modèle IA (Flask)

```bash
cd chatbot-model
python -m venv venv
source venv/bin/activate      # Windows : venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env          # Remplir GOOGLE_API_KEY et GROQ_API_KEY
python app.py
```

### 3. Backend (Node.js)

```bash
cd chatbot-backend
npm install

cp .env.example .env          # Remplir MONGO_URI et FLASK_API_URL
npm start
```

### 4. Frontend (React)

```bash
cd chatbot-frontend
npm install

cp .env.example .env          # Remplir REACT_APP_BACKEND_URL
npm start
```

---

## Lancement avec Docker

```bash
# Construire les images
docker build -t chatbot-model ./chatbot-model
docker build -t chatbot-backend ./chatbot-backend
docker build -t chatbot-frontend ./chatbot-frontend

# Lancer
docker run -p 5000:5000 --env-file chatbot-model/.env chatbot-model
docker run -p 3000:3000 --env-file chatbot-backend/.env chatbot-backend
docker run -p 80:3000 chatbot-frontend
```

---

## Variables d'Environnement

Chaque service dispose d'un fichier `.env.example` à copier en `.env` :

| Service | Variable | Description |
|---------|----------|-------------|
| `chatbot-model` | `GOOGLE_API_KEY` | Clé API Google Generative AI (embeddings) |
| `chatbot-model` | `GROQ_API_KEY` | Clé API Groq (LLama3-70b-8192) |
| `chatbot-model` | `FLASK_DEBUG` | Mode debug Flask (`True` / `False`) |
| `chatbot-backend` | `MONGO_URI` | URI de connexion MongoDB |
| `chatbot-backend` | `FLASK_API_URL` | URL du service modèle IA |
| `chatbot-frontend` | `REACT_APP_BACKEND_URL` | URL du backend Node.js |

---

## Pipeline CI/CD

### Pipeline CI (`azure-pipelines-ci.yml`)

```
Tests unitaires          Tests pytest
(Jest + Supertest)  ───► (Flask/Python)  ───► SonarQube ───► Trivy ───► Push Nexus
  Backend + Frontend         Modèle IA       Analyse qualité  Scan sécu   Registry
```

### Pipeline CD (`azure-pipelines.yml`)

```
kubectl apply ──► Ansible deploy
  K8s manifests     VM IA (modèle Flask)
```

---

## Tests

```bash
# Backend
cd chatbot-backend && npm test

# Frontend
cd chatbot-frontend && npm test -- --watchAll=false

# Modèle IA
cd chatbot-model && pytest test_app.py -v
```

---

## Infrastructure (Terraform)

L'infrastructure Azure Stack est définie dans `terraform/` :
- **Réseau** : VNet `10.0.0.0/16`, 6 sous-réseaux (AKS, gestion, IA, public, private)
- **VMs** : 3 VMs Ubuntu 18.04 (gestion, IA, MongoDB)
- **Sécurité** : NSG, route tables, FortiGate (firewall/NAT)

```bash
cd terraform
terraform init
terraform plan -var-file="secrets.tfvars"   # secrets.tfvars non commité
terraform apply -var-file="secrets.tfvars"
```

---

## Licence

MIT
