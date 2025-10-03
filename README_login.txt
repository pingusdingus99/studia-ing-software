Implementación de login con sesiones (express-session).

Cambios realizados:
- server.js: se añadió express-session y configuración básica de sesiones.
- src/controllers/authController.js: se implementaron registerUser, loginUser y logoutUser.
- src/routes/auth.js: se añadió ruta GET /auth/logout.
- views/login.html: formulario de login creado.
- package.json: se añadió dependencia express-session.

Notas:
- Para producción, se recomienda usar un session store (connect-pg-simple o redis) en vez del MemoryStore por defecto.
- Asegúrate de definir SESSION_SECRET en tu .env (o SECRET_KEY) para mayor seguridad.

Cómo instalar dependencias:
npm install

Cómo correr:
npm start
