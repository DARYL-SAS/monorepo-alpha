Arborescence Back-end:

backend/
│
├── server.js                # Point d'entrée principal de l'app
├── config/                  # Configurations (DB, variables d'env, etc.)
│   └── db.conf.js                # Connexion à MongoDB
│   └── db.keys.js
│   └── app.conf.js
│   └── app.keys.js
│
├── database/
│   ├── Redis.database.js
│
├── routes/                  # Définition des routes Express
│   └── project/
│       └──create.routes.js
│       └──read.routes.js
│       └──edit.routes.js
│       └──delete.routes.js
│       └──initiate.routes.js
│   └── evaluate/
│       └──
│   └── document/
│       └──input.routes.js
│       └──read.routes.js
│       └──edit.routes.js
│       └──delete.routes.js
│
├── controllers/             # Logique métier pour chaque route
│   └── project/
│       └──create.controller.js
│       └──read.controller.js
│       └──edit.controller.js
│       └──delete.controller.js
│       └──initiate.controller.js
│   └── document/
│       └──input.controller.js
│       └──read.controller.js
│       └──edit.controller.js
│       └──delete.controller.js
│
├── models/                  # Schémas Mongoose
│   └── 
│
├── middlewares/            # Middleware custom (auth, validation, etc.)
│   └── validateBody.middleware.js
│   └── validateParams.middleware.js
│   └── error.middleware.js
│   └── logger.middleware.js
│
├── utils/                   # Fonctions utilitaires
│   └── 
│
├── tests/                   # Tests unitaire / API
│   └──
├── node_modules
├── server.js
├── .env                     # Variables d'environnement
├── .gitignore
├── package.json
