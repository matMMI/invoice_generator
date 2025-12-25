# Devis Generator

## Quick Start

### Prérequis

- Python 3.14+
- Node.js 22+
- PostgreSQL (Neon)

### Lancer les serveurs

**Backend (FastAPI)** :

```bash
cd devis_generator_api
./start.sh
```

**Frontend (Next.js)** :

```bash
cd devis_generator
./start.sh
```

- Frontend : http://localhost:3000
- API : http://localhost:8000

---

## Seeder (Données de test)

Génère des clients et devis fictifs pour tester l'application.

```bash
cd devis_generator_api

# Avec les valeurs par défaut (30 clients, 200 devis)
./seed.sh

# Personnalisé
./seed.sh --clients 50 --quotes 300

# Aide
./seed.sh --help
```

---

## Stack

- **Frontend** : Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend** : FastAPI, SQLModel
- **Database** : Neon PostgreSQL
- **Auth** : Better Auth
