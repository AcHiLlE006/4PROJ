# SUPMAP – Application Mobile de Navigation

SUPMAP est une application mobile de navigation en temps réel basée sur **OpenStreetMap**. Elle permet aux utilisateurs de trouver les itinéraires les plus rapides et de signaler des incidents pour améliorer la circulation. Le système repose sur une **architecture microservices conteneurisée** avec **Docker**.

## 🚀 Fonctionnalités

- ✅ Authentification sécurisée (JWT + OAuth2 via Google/Facebook)
- 🧭 Calcul d’itinéraires optimisés (OSRM + données OSM)
- ⚠️ Signalement et détection d’incidents en temps réel
- 🔔 Notifications contextuelles et alertes sur le trajet
- 🗺️ Interface cartographique interactive (Leaflet + Angular)   

## 🧰 Prérequis

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Connexion Internet (pour récupérer les données OSM et les dépendances)

## ⚙️ Déploiement (mode local ou production)

### 🧪 En local

1. **Cloner le dépôt :**
   ```bash
   git clone <votre-repo-git>
   cd 4PROJ
   ```

2. **Configurer les variables d’environnement :**
   Charger le ficiher .env à la racine
   ```

3. **Lancer les services avec Docker Compose :**
   ```bash
   docker-compose up --build -d
   ```

4. **Vérification des services :**
   - API REST (NestJS) : http://localhost:3000
   - Interface web (Angular) : http://localhost:4200

## 📁 Structure du projet

```
4PROJ/
├── app-web/         # Interface utilisateur Angular (cartographie + interactions)
├── supmapapi/       # Backend NestJS (calcul d’itinéraires, gestion incidents, utilisateurs)
├── docker-compose.yml
└── README.md
```

## 🧪 Tests

Chaque microservice dispose de tests unitaires avec :
- **Jest** pour l’API NestJS (`supmapapi/test/`)
- **Karma + Jasmine** pour Angular (`app-web/src/app/**/*.spec.ts`)

Lancer tous les tests :
```bash
npm run test (test unitaires)
npm run test:integration (test d'integration)
npm run test:e2e (test end 2 end)

```

## 🤝 Contribuer

1. Fork du projet
2. Création de branche : `feature/ma-nouvelle-fonctionnalité`
3. Pull Request avec description claire
4. Validation des tests CI avant merge

## 👨‍💻 Équipe de développement

- **Achille Sanchez**
- **William Merifield**

## 📄 Licence

Projet académique – tous droits réservés.  
Usage à but pédagogique uniquement.
