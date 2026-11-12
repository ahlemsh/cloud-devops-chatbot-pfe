# cloud-devops-chatbot-pfe

> Projet de Fin d'Études — Déploiement cloud-native d'un chatbot d'entreprise sur **Azure Stack** avec une chaîne DevOps complète : **Azure DevOps CI/CD · Kubernetes · Terraform · Ansible · Docker · SonarQube · Trivy · Nexus**.

---

## Chaîne DevOps complète

C'est le cœur du projet. Chaque push sur `main` déclenche deux pipelines Azure DevOps en séquence.

### Pipeline CI — Qualité & Sécurité (`azure-pipelines-ci.yml`)

```
┌──────────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────┐     ┌─────────────┐
│  Tests       │     │  Tests       │     │             │     │           │     │             │
│  unitaires   │────►│  pytest      │────►│  SonarQube  │────►│   Trivy   │────►│    Nexus    │
│  Jest +      │     │  Flask /     │     │  Analyse    │     │  Security │     │  Registry   │
│  Supertest   │     │  Python      │     │  3 projets  │     │  scan     │     │  Push       │
│  (Backend +  │     │  (Modèle IA) │     │             │     │  images   │     │  images     │
│  Frontend)   │     │              │     │             │     │  Docker   │     │  Docker     │
└──────────────┘     └──────────────┘     └─────────────┘     └───────────┘     └─────────────┘
```

**Détail des étapes :**
- **Tests Jest + Supertest** : tests unitaires et d'intégration du backend Node.js (mongodb-memory-server)
- **Tests React Testing Library** : tous les composants frontend couverts
- **Tests pytest** : endpoints Flask (upload, chat, edge cases)
- **SonarQube** : analyse statique sur 3 projets séparés (backend, frontend, modèle IA) — couverture, bugs, code smells
- **Trivy** : scan de vulnérabilités CVE sur les 3 images Docker avant tout push
- **Nexus Repository** : registre Docker privé, les images taguées et validées sont poussées ici

### Pipeline CD — Déploiement (`azure-pipelines.yml`)

```
┌─────────────────────────┐          ┌──────────────────────────┐
│                         │          │                          │
│   kubectl apply         │          │   Ansible Playbook       │
│                         │          │                          │
│   k8s/backend/          │          │   Déploiement modèle IA  │
│   k8s/frontend/         │──────────│   sur VM dédiée          │
│                         │          │   (10.0.4.4)             │
│   AKS — Azure Stack     │          │   Docker pull Nexus      │
│                         │          │   + run Flask container  │
└─────────────────────────┘          └──────────────────────────┘
```

**Pas de déploiement manuel.** Le pipeline gère tout : apply des manifestes K8s, pull des images depuis Nexus, et provisioning du service IA via Ansible.

---

## Infrastructure Cloud (Azure Stack + Terraform)

L'infrastructure complète est définie en **Infrastructure as Code** avec Terraform (`provider azurestack`).

```
Azure Stack
│
├── Resource Group
│   │
│   ├── VNet  10.0.0.0/16
│   │   ├── Subnet AKS          (frontend + backend Deployments K8s)
│   │   ├── Subnet Management   (VM gestion)
│   │   ├── Subnet IA           (VM modèle Flask + FAISS)
│   │   ├── Subnet MongoDB      (VM base de données)
│   │   └── Subnet Public/DMZ
│   │
├── 3 VMs Ubuntu 18.04
│   │   ├── VM-Management
│   │   ├── VM-IA               ← modèle Flask déployé via Ansible
│   │   └── VM-MongoDB
│   │
│   ├── NSG + Route Tables      ← Règles réseau inbound/outbound
│   └── NICs (IPs statiques)
│
└── AKS Cluster
    ├── Deployment: chatbot-frontend   (NodePort)
    └── Deployment: chatbot-backend    (NodePort)
```

**Fichiers Terraform :** `provider.tf` · `network.tf` · `vm.tf` · `nic.tf` · `security.tf` · `route_table.tf` · `variables.tf` · `outputs.tf`

---

## Architecture Applicative

```
Utilisateur
    │
    ▼
┌─────────────────────┐
│  React 19 (Frontend)│  ← Kubernetes Deployment (AKS)
│  Sidebar · Sessions │
│  Chat UI · FAQ      │
└──────────┬──────────┘
           │ HTTP / Axios
           ▼
┌─────────────────────┐
│  Node.js / Express  │  ← Kubernetes Deployment (AKS)
│  Backend + MongoDB  │
│  Sessions UUID · NLP│
│  Prometheus /metrics│
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│  Flask + LangChain  │  ← VM dédiée (Ansible)
│  LLama3-70b (Groq)  │
│  FAISS vectorstore  │
│  Google AI Embeddings│
│  Prometheus /metrics│
└─────────────────────┘
```

---

## Stack Technique

### Application
| Couche | Technologies |
|--------|-------------|
| Frontend | React 19, Axios, React Testing Library, Cypress |
| Backend | Node.js, Express 4, MongoDB, Mongoose, UUID, `natural`, `stopword` |
| Modèle IA | Python 3.9, Flask, LangChain, LLama3-70b-8192 (Groq), FAISS, Google Generative AI |
| Monitoring | Prometheus — `prom-client` (Node.js) + `prometheus_flask_exporter` (Flask) |

### DevOps & Cloud
| Outil | Rôle |
|-------|------|
| **Azure DevOps** | Orchestration CI/CD — 2 pipelines (CI + CD) |
| **Docker** | Multi-stage builds — 3 images (Node 18 Alpine, Python 3.9 slim) |
| **Kubernetes** | Orchestration conteneurs — AKS sur Azure Stack |
| **Terraform** | IaC — réseau, VMs, sécurité Azure Stack |
| **Ansible** | Configuration management — déploiement VM IA |
| **SonarQube** | Analyse statique qualité — 3 projets |
| **Trivy** | Scan CVE images Docker |
| **Nexus** | Registry Docker privé |

---

## Fonctionnalités du Chatbot

- **RAG** : embeddings Google AI → stockage FAISS → retrieval LLama3-70b (Groq) avec historique de conversation
- **Sessions persistantes** : UUID stockés dans MongoDB, nommées automatiquement par NLP (extraction mots-clés)
- **Interface** : sidebar sessions, FAQ intégrée, indicateur de frappe, suppression de session

---

## Structure du Projet

```
cloud-devops-chatbot-pfe/
├── chatbot-backend/          # API Node.js + Express + MongoDB
├── chatbot-frontend/         # Interface React 19
├── chatbot-model/            # Flask + LangChain + FAISS (RAG)
├── k8s/
│   ├── backend/              # Deployment + Service K8s backend
│   ├── frontend/             # Deployment + Service K8s frontend
│   └── ansible/              # Playbook déploiement VM IA
├── terraform/                # IaC Azure Stack complet
├── azure-pipelines-ci.yml    # Pipeline CI : tests → SonarQube → Trivy → Nexus
├── azure-pipelines.yml       # Pipeline CD : K8s apply + Ansible deploy
└── rfc.txt                   # Base de connaissance du chatbot
```

---

## Lancer le projet localement

### Prérequis
- Node.js 18+, Python 3.9+, MongoDB, Docker
- Clés API : [Google Generative AI](https://aistudio.google.com/) · [Groq](https://console.groq.com/)

```bash
# Modèle IA
cd chatbot-model && python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # remplir GOOGLE_API_KEY et GROQ_API_KEY
python app.py

# Backend
cd chatbot-backend && npm install
cp .env.example .env   # remplir MONGO_URI et FLASK_API_URL
npm start

# Frontend
cd chatbot-frontend && npm install
cp .env.example .env   # remplir REACT_APP_BACKEND_URL
npm start
```

### Variables d'environnement

| Service | Variable | Description |
|---------|----------|-------------|
| `chatbot-model` | `GOOGLE_API_KEY` | Embeddings Google Generative AI |
| `chatbot-model` | `GROQ_API_KEY` | LLM LLama3-70b via Groq |
| `chatbot-backend` | `MONGO_URI` | Connexion MongoDB |
| `chatbot-backend` | `FLASK_API_URL` | URL service modèle IA |
| `chatbot-frontend` | `REACT_APP_BACKEND_URL` | URL backend Node.js |

---

## Tests

```bash
cd chatbot-backend  && npm test                        # Jest + Supertest
cd chatbot-frontend && npm test -- --watchAll=false    # React Testing Library
cd chatbot-model    && pytest test_app.py -v           # pytest
```

---

## Infrastructure Terraform

```bash
cd terraform
terraform init
terraform plan  -var-file="secrets.tfvars"
terraform apply -var-file="secrets.tfvars"
# secrets.tfvars n'est pas commité — variables gérées via Azure DevOps pipeline
```

---

## Licence

MIT
