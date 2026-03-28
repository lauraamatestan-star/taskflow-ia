# TaskFlow

TaskFlow es una aplicacion de gestion de tareas con frontend en JavaScript vanilla y backend en Node.js + Express.

## 1. Descripcion general

TaskFlow permite crear, listar, actualizar y eliminar tareas desde una interfaz web. El frontend consume una API REST para persistir tareas en memoria del servidor durante la ejecucion.

### Stack tecnologico

- Backend: Node.js, Express, dotenv, cors
- Frontend: HTML, CSS, JavaScript vanilla
- Herramientas: nodemon para desarrollo

## 2. Instalacion y ejecucion

1. Clonar el repositorio.

```bash
git clone <url-del-repositorio>
cd taskflow-ia
```

2. Instalar dependencias del backend.

```bash
cd server
npm install
```

3. Crear el archivo `server/.env`.

```env
PORT=3000
NODE_ENV=development
```

4. Ejecutar el servidor.

```bash
npm run dev
```

5. Abrir el frontend.

- Frontend: `docs/ai/index.html`
- API: `http://localhost:3000/api/v1/tasks`

## 3. Arquitectura del backend

El backend sigue una arquitectura por capas:

- `routes`: define rutas y verbos HTTP
- `controllers`: valida entrada, llama servicios y arma la respuesta HTTP
- `services`: contiene logica de negocio pura, sin dependencias de Express

### Por que se separan

- Facilita mantenimiento y lectura del codigo
- Permite probar logica de negocio sin HTTP
- Evita mezclar responsabilidades en un solo archivo

### Flujo de peticion (ASCII)

```text
Cliente (fetch)
		|
GET /api/v1/tasks
		|
[Router] Mapea verbo HTTP
		|
[Controlador] Valida entrada, llama service
		|
[Servicio] Logica pura, retorna datos
		|
[Controlador] Formatea respuesta HTTP
		|
JSON 200 OK
```

## 4. Ejemplos de request/response

### 1) Crear tarea

```http
POST /api/v1/tasks
Content-Type: application/json
```

```json
{
	"titulo": "Aprender backend",
	"prioridad": 2
}
```

Respuesta `201 Created`:

```json
{
	"id": 1234567890,
	"titulo": "Aprender backend",
	"prioridad": 2,
	"completada": false
}
```

---

### 2) Obtener todas

```http
GET /api/v1/tasks
```

Respuesta `200 OK`:

```json
[
	{ "id": 1234567890, "titulo": "Aprender backend", "prioridad": 2, "completada": false },
	{ "id": 1234567891, "titulo": "Practicar API", "prioridad": 1, "completada": true }
]
```

---

### 3) Eliminar

```http
DELETE /api/v1/tasks/1234567890
```

Respuesta `204 No Content` (sin cuerpo).

## 5. Codigos HTTP utilizados

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

## 6. API Reference Completa

### GET /api/v1/tasks

**Descripcion:** Obtiene el listado completo de tareas almacenadas en memoria.

**Metodo:** `GET`  
**URL:** `/api/v1/tasks`

#### Parametros

- Path: ninguno
- Query: ninguno
- Body: ninguno

#### Response 200 OK

```json
[
  {
    "id": 1710963840000,
    "titulo": "Aprender Express",
    "prioridad": 2,
    "completada": false
  },
  {
    "id": 1710963850000,
    "titulo": "Practicar controladores",
    "prioridad": 3,
    "completada": true
  }
]
```

#### Errores posibles

- No hay errores de validacion esperados en condiciones normales para este endpoint.

#### cURL Example

```bash
curl http://localhost:3000/api/v1/tasks
```

### POST /api/v1/tasks

**Descripcion:** Crea una nueva tarea con titulo obligatorio y prioridad opcional.

**Metodo:** `POST`  
**URL:** `/api/v1/tasks`  
**Content-Type:** `application/json`

#### Parametros

- Path: ninguno
- Query: ninguno
- Body:

```json
{
  "titulo": "string (requerido, 3-120 caracteres)",
  "prioridad": "number (opcional, 1-3, default 2)",
  "completada": "boolean (opcional, default false)"
}
```

#### Response 201 Created

```json
{
  "id": 1710963840000,
  "titulo": "Leer documentacion de Express",
  "prioridad": 2,
  "completada": false
}
```

#### Errores posibles

**400 Bad Request**

```json
{
  "error": "El título debe ser un texto"
}
```

```json
{
  "error": "El título debe tener entre 3 y 120 caracteres"
}
```

```json
{
  "error": "La prioridad debe ser un número entre 1 y 3"
}
```

```json
{
  "error": "El body es obligatorio"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi tarea","prioridad":2}'
```

### GET /api/v1/tasks/:id

**Descripcion:** Obtiene una tarea concreta a partir de su identificador numerico.

**Metodo:** `GET`  
**URL:** `/api/v1/tasks/:id`

#### Parametros

- Path:

```text
id: number (requerido, entero mayor a 0)
```

- Query: ninguno
- Body: ninguno

#### Response 200 OK

```json
{
  "id": 1710963840000,
  "titulo": "Aprender Express",
  "prioridad": 2,
  "completada": false
}
```

#### Errores posibles

**400 Bad Request**

```json
{
  "error": "El id debe ser numérico y mayor a 0"
}
```

**404 Not Found**

```json
{
  "error": "Tarea no encontrada"
}
```

#### cURL Example

```bash
curl http://localhost:3000/api/v1/tasks/1710963840000
```

### PATCH /api/v1/tasks/:id

**Descripcion:** Actualiza parcialmente una tarea existente. Solo modifica los campos enviados.

**Metodo:** `PATCH`  
**URL:** `/api/v1/tasks/:id`  
**Content-Type:** `application/json`

#### Parametros

- Path:

```text
id: number (requerido, entero mayor a 0)
```

- Query: ninguno
- Body:

```json
{
  "titulo": "string (opcional, 3-120 caracteres)",
  "prioridad": "number (opcional, 1-3)",
  "completada": "boolean (opcional)"
}
```

#### Response 200 OK

```json
{
  "id": 1710963840000,
  "titulo": "Aprender Express y Node.js",
  "prioridad": 3,
  "completada": true
}
```

#### Errores posibles

**400 Bad Request**

```json
{
  "error": "El id debe ser numérico y mayor a 0"
}
```

```json
{
  "error": "El título debe tener entre 3 y 120 caracteres"
}
```

```json
{
  "error": "La prioridad debe ser un número entre 1 y 3"
}
```

```json
{
  "error": "El campo completada debe ser booleano"
}
```

```json
{
  "error": "El body es obligatorio"
}
```

**404 Not Found**

```json
{
  "error": "Tarea no encontrada"
}
```

#### cURL Example

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/1710963840000 \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Nuevo titulo","prioridad":3,"completada":true}'
```

### DELETE /api/v1/tasks/:id

**Descripcion:** Elimina una tarea por ID.

**Metodo:** `DELETE`  
**URL:** `/api/v1/tasks/:id`

#### Parametros

- Path:

```text
id: number (requerido, entero mayor a 0)
```

- Query: ninguno
- Body: ninguno

#### Response 204 No Content

Este endpoint no devuelve cuerpo cuando la eliminacion es correcta.

#### Errores posibles

**400 Bad Request**

```json
{
  "error": "El id debe ser numérico y mayor a 0"
}
```

**404 Not Found**

```json
{
  "error": "Tarea no encontrada"
}
```

#### cURL Example

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/1710963840000
```