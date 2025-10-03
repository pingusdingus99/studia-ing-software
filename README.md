# Studia habit tracker
Proyecto de página web para registrar hábitos con Express y PostgreSQL

## Requisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/)  
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

## Instalación
1. Clonar la repo:
```bash
git clone https://github.com/pingusdingus99/studia-ing-software.git
cd studia-ing-software
```
2. Instalar dependencias:
```bash
npm install
```
3. Crear archivo .env en la raíz copiando formato de .env.example
```bash
cp .env.example .env
```
## Levantar la base de datos con Docker:
1. Iniciar Postgres + pgAdmin:
```bash
docker-compose up -d
```
2. Acceder a pgAdmin en **http://localhost:8080**
- usuario:  admin@studia.com
- contraseña: studiapass

3. Conectar pgAdmin al servidor postgres:
- Host: db
- Usuario: studia
- Constraseña: studiapass
- Base de datos: habits_db

4. Acceder directamente a la db sin pgAdmin (preferencia):
```bash
sudo docker exec -it studia_postgres psql -U studia -d habits_db
```
## Ejecutar la aplicación:
```bash
npm run dev
```
El servidor quedará en **http://localhost:3000**