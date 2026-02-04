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

## Variables d'environnement

### BETTER_AUTH_SECRET

Secret utilisé par Better Auth pour signer les sessions et tokens. Doit faire au moins 32 caractères.

```bash
# Avec openssl
openssl rand -base64 32

# Avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copier la valeur dans `.env.local` :

```
BETTER_AUTH_SECRET=<valeur_generee>
```

---

## Stack

- **Frontend** : Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend** : FastAPI, SQLModel
- **Database** : Neon PostgreSQL
- **Auth** : Better Auth
