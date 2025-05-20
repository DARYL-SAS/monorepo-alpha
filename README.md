**Structure du projet**

monorepo-daryl/
├── frontend/ # Application web (React, tailwind, axios, clsx, lucide-react)
├── backend/ # API (Express, dotenv, multer, uuid, cors)
├── ia/ # Scripts et modèles IA
├── package.json/ dépendance commune entre back et front

Chaque dossier est **autonome**, avec ses propres dépendances, outils, tests et environnement.

la