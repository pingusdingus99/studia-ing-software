# Studia habit tracker
Proyecto de página web para registrar hábitos con Express y PostgreSQL

## Requisitos
- Node.js >= 18
- PostgreSQL >= 14

## Instalación
1. Clonar la repo:
```bash
git clone https://github.com/pingusdingus99/studia-ing-software.git
cd habit-tracker
```
2. Instalar dependencias:
```bash
npm install
```
3. Crear archivo .env en la raíz copiando formato de .env.example
```bash
cp .env.example .env
```
4. Crear la base de datos:
```bash
createdb habits_db
psql -d habits_db -f schema.sql
```
5. Levantar el servidor en modo desarrollo:
```bash
npm run dev
```
El servidor quedará en **http://localhost:3000**