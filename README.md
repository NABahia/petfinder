# PetFinder

Webapp full-stack que permite registrarse, reportar mascotas perdidas con geolocalización y foto, buscar mascotas perdidas cercanas y enviar notificaciones por email al dueño cuando alguien reporta un avistamiento.

## Links de entrega

- **Webapp en producción:** [https://petfinder-atlz.onrender.com/](https://petfinder-atlz.onrender.com/)
- **Documentación API (Postman):**

---

## Tecnologías

- **Backend:** Node.js, Express 5, TypeScript, Sequelize, PostgreSQL, JWT, Bcrypt
- **Servicios externos:**
  - **Algolia:** búsqueda geoespacial (`aroundLatLng` + `aroundRadius`)
  - **Cloudinary:** subida y optimización de imágenes
  - **Resend:** envío de notificaciones por email al dueño
- **Frontend:** Web Components, TypeScript, `@vaadin/router`, Parcel, Dropzone, Leaflet

---

## Arquitectura (MVC)

```text
petfinder/
├── be-src/
│   ├── index.ts             # Configuración del servidor Express y montaje de rutas
│   ├── sync.ts              # Sincronización de modelos con PostgreSQL
│   ├── routes/              # Definición de endpoints por recurso
│   │   ├── auth-routes.ts
│   │   ├── users-routes.ts
│   │   └── pets-routes.ts
│   ├── controllers/         # Lógica de negocio
│   │   ├── users-controller.ts
│   │   ├── pets-controller.ts
│   │   └── report-controller.ts
│   ├── models/              # Modelos Sequelize y relaciones (User, Pet, Report)
│   ├── middleware/          # Middleware de autenticación JWT
│   └── lib/                 # Clientes externos (Algolia, Cloudinary)
├── fe-src/
│   ├── index.html
│   ├── index.ts
│   ├── router.ts
│   ├── state.ts
│   ├── api.ts
│   ├── components/          # Header con menú de navegación
│   └── pages/               # Pantallas de la webapp
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Endpoints de la API

### Autenticación (`/auth`)

| Método | Endpoint      | Auth | Descripción                                                  |
| :----- | :------------ | :--: | :----------------------------------------------------------- |
| `POST` | `/auth`       |  No  | Registra un nuevo usuario (`name`, `email`, `password`).     |
| `POST` | `/auth/token` |  No  | Inicia sesión y devuelve un token JWT (`email`, `password`). |

### Usuario (`/user`)

| Método | Endpoint        |  Auth  | Descripción                                                         |
| :----- | :-------------- | :----: | :------------------------------------------------------------------ |
| `GET`  | `/user/me`      | Bearer | Obtiene los datos del usuario autenticado.                          |
| `PUT`  | `/user/me`      | Bearer | Actualiza nombre (`name` o `fullname`) y/o contraseña (`password`). |
| `GET`  | `/user/me/pets` | Bearer | Lista las mascotas reportadas por el usuario autenticado.           |

### Mascotas y reportes (`/pets`)

| Método   | Endpoint                        |  Auth  | Descripción                                                                                                                |
| :------- | :------------------------------ | :----: | :------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/pets`                         |   No   | Lista todas las mascotas registradas.                                                                                      |
| `GET`    | `/pets/cerca?lat=&lng=&radius=` |   No   | Busca mascotas perdidas cercanas usando Algolia (`radius` por defecto `5000` m).                                           |
| `GET`    | `/pets/:id`                     |   No   | Obtiene el detalle de una mascota por ID.                                                                                  |
| `POST`   | `/pets`                         | Bearer | Crea un reporte de mascota perdida (`name`, `location`, `lat`, `lng`, `pictureData`).                                      |
| `PUT`    | `/pets/:id`                     | Bearer | Actualiza datos o estado (`"lost"` / `"found"`) de una mascota propia.                                                     |
| `DELETE` | `/pets/:id`                     | Bearer | Elimina una mascota propia de PostgreSQL y Algolia.                                                                        |
| `POST`   | `/pets/:id/report`              |   No   | Reporta un avistamiento (`reporterName`, `phone`, `location`, `lat`, `lng`, `pictureData?`) y notifica por email al dueño. |

---

## Variables de entorno

Copiá `.env.example` a `.env` y completá tus credenciales (en producción, configurá estas mismas variables en Render o Railway):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=
ALGOLIA_INDEX_NAME=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
```

---

## Cómo correr el proyecto localmente

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Sincronizar las tablas en PostgreSQL:
   ```bash
   npm run sync
   ```
3. Iniciar backend y frontend en modo desarrollo (en dos terminales):
   ```bash
   npm run dev:be
   npm run dev:fe
   ```
4. Para compilar y ejecutar el build de producción:
   ```bash
   npm run build
   npm start
   ```
