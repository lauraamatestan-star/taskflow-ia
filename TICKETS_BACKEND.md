# Tickets TaskFlow - Construcción Backend Express

## Estado Actual del Proyecto
- ✅ Frontend funcional con LocalStorage (docs/ai/)
- ❌ Backend no creado aún

---

## FASE A: Infraestructura y Variables de Entorno

### Ticket A1: Inicialización del proyecto Node.js
**Descripción:**
- Crear directorio `/server` en la raíz del proyecto TaskFlow
- Navegar a `/server`
- Ejecutar `npm init -y` para crear package.json
- Verificar que se crean los archivos base

**Criterios de aceptación:**
- Existe `/server/package.json`
- El archivo contiene nombre "taskflow-backend" 
- Versión inicial es "1.0.0"

**Estimación:** 5 min
**Tags:** Setup, Backend

---

### Ticket A2: Instalación de dependencias de producción
**Descripción:**
- En la carpeta `/server`, instalar las siguientes dependencias de producción:
  - `express` (framework web)
  - `cors` (gestión de CORS)
  - `dotenv` (variables de entorno)

**Comandos a ejecutar:**
```bash
npm install express cors dotenv
```

**Criterios de aceptación:**
- `package.json` contiene los 3 paquetes en "dependencies"
- Se crea carpeta `node_modules`
- Se crea archivo `package-lock.json`

**Estimación:** 5 min
**Tags:** Setup, Dependencias

---

### Ticket A3: Instalación de dependencias de desarrollo
**Descripción:**
- En la carpeta `/server`, instalar las siguientes dependencias de desarrollo:
  - `nodemon` (recarga automática en desarrollo)

**Comandos a ejecutar:**
```bash
npm install --save-dev nodemon
```

**Criterios de aceptación:**
- `package.json` contiene `nodemon` en "devDependencies"
- `package-lock.json` actualizado

**Estimación:** 5 min
**Tags:** Setup, Dependencias 

---

### Ticket A4: Crear archivo .env con variables de entorno
**Descripción:**
- En la carpeta `/server`, crear archivo `.env`
- Definir la variable: `PORT=3000`
- Este archivo NO debe commitearse a git (contiene configuraciones sensibles)

**Contenido del archivo .env:**
```
PORT=3000
NODE_ENV=development
```

**Criterios de aceptación:**
- Existe `/server/.env`
- Contiene las 2 variables listadas

**Estimación:** 5 min
**Tags:** Configuración, Seguridad

---

### Ticket A5: Actualizar .gitignore para excluir .env
**Descripción:**
- Abrir el archivo `.gitignore` en la raíz del proyecto
- Agregar línea: `server/.env`
- Agregar línea: `server/node_modules`

**Criterios de aceptación:**
- `.gitignore` contiene ambas líneas
- Los archivos `.env` y `node_modules` no se traquearan en git

**Estimación:** 5 min
**Tags:** Configuración, Seguridad, Git

---

### Ticket A6: Crear módulo de configuración del entorno
**Descripción:**
- Crear directorio estructurado: `/server/src/config`
- Crear archivo `/server/src/config/env.js`
- Este archivo debe:
  1. Requerir 'dotenv' e invocar `.config()`
  2. Validar que `process.env.PORT` existe
  3. Si no existe, lanzar error: `throw new Error('La variable PORT no está definida en .env')`
  4. Exportar las variables de entorno como objeto

**Código esperado (referencia):**
```javascript
require('dotenv').config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!PORT) {
  throw new Error('La variable PORT no está definida en .env');
}

module.exports = {
  PORT,
  NODE_ENV
};
```

**Criterios de aceptación:**
- Existe `/server/src/config/env.js`
- El archivo requiere dotenv y hace `.config()`
- Si desaparece la variable PORT del .env, el servidor debe lanzar error
- El módulo exporta un objeto con PORT y NODE_ENV

**Estimación:** 10 min
**Tags:** Configuración, Validación

---

### Ticket A7: Crear archivo inicial del servidor
**Descripción:**
- Crear archivo `/server/src/index.js` (punto de entrada principal)
- Este archivo solo debe:
  1. Importar express
  2. Importar la configuración (env.js)
  3. Crear instancia de express: `const app = express()`
  4. Usar middleware global: `app.use(express.json())`
  5. Crear ruta de prueba GET / que retorne JSON simple: `{ message: 'Servidor funcionando' }`
  6. Iniciar el servidor: `app.listen(PORT, () => { console.log(...) })`

**Código esperado (referencia):**
```javascript
const express = require('express');
const { PORT } = require('./config/env');

const app = express();

// Middleware global
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor TaskFlow funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[TaskFlow API] Servidor escuchando en puerto ${PORT}`);
});
```

**Criterios de aceptación:**
- Existe `/server/src/index.js`
- Contiene la estructura descrita
- No tiene rutas de negocio aún (solo la prueba /)
- Importa la configuración correctamente

**Estimación:** 10 min
**Tags:** Setup, Express

---

### Ticket A8: Configurar scripts de npm en package.json
**Descripción:**
- Abrir `/server/package.json`
- En la sección "scripts", reemplazar script "test" por:
  - `"dev": "nodemon src/index.js"` (desarrollo con auto-reload)
  - `"start": "node src/index.js"` (producción)

**Contenido esperado en scripts:**
```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js"
}
```

**Criterios de aceptación:**
- `package.json` contiene ambos scripts
- `npm run dev` inicia el servidor con nodemon
- El servidor se reinicia automáticamente al guardar cambios en src/

**Estimación:** 5 min
**Tags:** Setup, Scripts

---

### Ticket A9: Prueba de arranque del servidor
**Descripción:**
- Abrir terminal en la carpeta `/server`
- Ejecutar: `npm run dev`
- Verificar que el servidor arranca sin errores
- Probar en navegador: `http://localhost:3000`
- Debe retornar: `{ "message": "Servidor TaskFlow funcionando" }`
- Detener el servidor con Ctrl+C

**Criterios de aceptación:**
- El servidor arranca sin errores
- Responde correctamente a GET /
- Nodemon recarga al cambiar archivos en src/
- No hay mensajes de error en consola

**Estimación:** 10 min
**Tags:** Testing, Validación

---

## FASE B: Ingeniería del Dominio y Arquitectura por Capas

### Ticket B1: Crear capa de servicios - task.service.js
**Descripción:**
- Crear directorio `/server/src/services`
- Crear archivo `/server/src/services/task.service.js`
- Este archivo implementa la lógica PURA de negocio (sin Express, sin req/res)
- SIMULAR persistencia con array en memoria: `let tasks = []`
- Implementar 5 métodos:

1. **obtenerTodas()** → retorna copia del array `tasks`

2. **obtenerPorId(id)** → busca tarea por id, lanza error si no existe con mensaje 'NOT_FOUND'

3. **crearTarea(data)** → recibe objeto {titulo, prioridad, completada}
   - Generar ID único (ej: `Date.now()` o `Math.random()`)
   - Agregarla a `tasks`
   - Retornar la tarea creada con ID

4. **actualizarTarea(id, data)** → busca tarea, actualiza campos, lanza 'NOT_FOUND' si no existe

5. **eliminarTarea(id)** → busca y remueve tarea, lanza 'NOT_FOUND' si no existe

**Notas importantes:**
- Cada método debe ser corto y limpio
- Si ocurre un error de lógica, LANZAR TypeError o Error con mensaje descriptivo
- No incluir express, req, res, res.json() aquí
- Exportar un objeto con los 5 métodos

**Criterios de aceptación:**
- Existe `/server/src/services/task.service.js`
- Contiene los 5 métodos mencionados
- El servicio es exportado correctamente
- No hay referencias a Express o HTTP

**Estimación:** 20 min
**Tags:** Backend, Servicios, Lógica

---

### Ticket B2: Crear capa de controladores - task.controller.js
**Descripción:**
- Crear directorio `/server/src/controllers`
- Crear archivo `/server/src/controllers/task.controller.js`
- Este archivo mapea peticiones HTTP a lógica de negocio
- Importar el service: `const taskService = require('../services/task.service')`
- Implementar 5 controladores:

1. **obtenerTodas(req, res)**
   - Llama a `taskService.obtenerTodas()`
   - Retorna `res.status(200).json(tareas)`

2. **obtenerPorId(req, res)**
   - Extrae `id` de `req.params.id`
   - VALIDAR que id existe y es numérico
   - Llama a `taskService.obtenerPorId(id)`
   - Retorna `res.status(200).json(tarea)`
   - Si error 'NOT_FOUND': `res.status(404).json({ error: 'Tarea no encontrada' })`

3. **crearTarea(req, res)**
   - VALIDAR que `req.body` existe y contiene:
     - `titulo`: string, debe tener al menos 3 caracteres, máximo 120
     - `prioridad`: número entre 1 y 3 (opcional, default 2)
   - Si validación falla, retornar `res.status(400).json({ error: 'mensaje descriptivo' })`
   - Llama a `taskService.crearTarea()`
   - Retorna `res.status(201).json(tarea)` (código 201 = Created)

4. **actualizarTarea(req, res)**
   - Extrae `id` de `req.params.id`
   - VALIDAR que `titulo` si es enviado cumple reglas (3-120 caracteres)
   - Llama a `taskService.actualizarTarea(id, req.body)`
   - Retorna `res.status(200).json(tarea)`
   - Si error 'NOT_FOUND': `res.status(404).json({ error: '...' })`

5. **eliminarTarea(req, res)**
   - Extrae `id` de `req.params.id`
   - Llama a `taskService.eliminarTarea(id)`
   - Retorna `res.status(204).send()` (sin cuerpo de respuesta)
   - Si error 'NOT_FOUND': `res.status(404).json({ error: '...' })`

**Notas importantes:**
- TODA validación de entrada ocurre aquí (en la frontera HTTP)
- El controlador es muy delgado: solo extrae, valida, llama al service y formatea respuesta
- Usar números HTTP correctos: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 404 (Not Found)

**Criterios de aceptación:**
- Existe `/server/src/controllers/task.controller.js`
- Contiene los 5 controladores
- Cada uno valida entrada defensivamente
- Usa códigos HTTP semánticamente correctos
- Exporta los 5 controladores

**Estimación:** 30 min
**Tags:** Backend, Controladores, Validación

---

### Ticket B3: Crear capa de enrutamiento - task.routes.js
**Descripción:**
- Crear directorio `/server/src/routes`
- Crear archivo `/server/src/routes/task.routes.js`
- Este archivo mapea URLs y verbos HTTP a controladores
- Importar express y router: `const express = require('express'); const router = express.Router();`
- Importar controlador: `const controllers = require('../controllers/task.controller');`
- Definir 5 rutas:

1. **GET /** (en el router) → `router.get('/', controllers.obtenerTodas);`
2. **POST /** → `router.post('/', controllers.crearTarea);` (se monta con prefijo /api/v1/tasks, luego POST /api/v1/tasks crea)
3. **GET /:id** → `router.get('/:id', controllers.obtenerPorId);`
4. **PATCH /:id** → `router.patch('/:id', controllers.actualizarTarea);` (actualizaciones parciales)
5. **DELETE /:id** → `router.delete('/:id', controllers.eliminarTarea);`

- Exportar el router: `module.exports = router;`

**Notas importantes:**
- El router no existe por sí solo; debe montarse en index.js con `app.use('/api/v1/tasks', router)`
- Las rutas aquí son RELATIVAS al prefijo
- No añadir lógica en el router; solo mapear verbos a controladores

**Criterios de aceptación:**
- Existe `/server/src/routes/task.routes.js`
- Contiene las 5 rutas CRUD
- Importa controladores correctamente
- Exporta el router
- No hay lógica de negocio en el router

**Estimación:** 15 min
**Tags:** Backend, Rutas, REST

---

### Ticket B4: Montar router en servidor principal (index.js)
**Descripción:**
- Modificar `/server/src/index.js`
- Importar el router: `const taskRoutes = require('./routes/task.routes');`
- Montar el router ANTES de iniciar el servidor:
  - `app.use('/api/v1/tasks', taskRoutes);`
- Mantener la ruta GET / de prueba
- El servidor ahora estará listo para recibir peticiones a:
  - GET /api/v1/tasks
  - POST /api/v1/tasks
  - GET /api/v1/tasks/:id
  - PATCH /api/v1/tasks/:id
  - DELETE /api/v1/tasks/:id

**Criterios de aceptación:**
- `/server/src/index.js` importa y monta el router
- La ruta de prueba GET / sigue funcionando
- El servidor arranca sin errores
- Las 5 nuevas rutas están disponibles (sin errores de 404 aún)

**Estimación:** 10 min
**Tags:** Backend, Setup

---

### Ticket B5: Prueba manual de API CRUD
**Descripción:**
- Arrancar servidor: `npm run dev`
- CREAR tarea: POST a `http://localhost:3000/api/v1/tasks` con JSON:
  ```json
  { "titulo": "Aprender Express", "prioridad": 2 }
  ```
  Debe retornar 201 + tarea {id, titulo, prioridad, completada}
  
- OBTENER todas: GET `http://localhost:3000/api/v1/tasks`
  Debe retornar 200 + array de tareas

- OBTENER por id: GET `http://localhost:3000/api/v1/tasks/1` (reemplazar con id real)
  Debe retornar 200 + tarea específica

- ACTUALIZAR: PATCH `http://localhost:3000/api/v1/tasks/1` con `{ "titulo": "Nueva descripción" }`
  Debe retornar 200 + tarea actualizada

- ELIMINAR: DELETE `http://localhost:3000/api/v1/tasks/1`
  Debe retornar 204 (sin cuerpo)

**Herramienta:** Usar Postman, Thunder Client o curl

**Criterios de aceptación:**
- Las 5 operaciones funcionan
- Todos los códigos HTTP son correctos
- Sin errores en consola del servidor

**Estimación:** 20 min
**Tags:** Testing, API, Manual

---

## FASE C: Robustez, Manejo de Errores y Pruebas

### Ticket C1: Implementar middleware global de manejo de errores
**Descripción:**
- En `/server/src/index.js`, al FINAL (después de todas las rutas), agregar middleware de error
- Este middleware tiene EXACTAMENTE 4 parámetros: `(err, req, res, next)`
- La función debe:
  1. Registrar el error en consola: `console.error('[ERROR]', err);`
  2. Evaluar el mensaje del error:
     - Si contiene 'NOT_FOUND': `res.status(404).json({ error: 'Recurso no encontrado' })`
     - Si contiene 'validation' o es mensaje del controlador (400): `res.status(400).json({ error: err.message })`
     - Para cualquier otro error no controlado: `res.status(500).json({ error: 'Error interno del servidor' })`
  3. NUNCA exponer detalles técnicos al cliente (no enviar stack traces)

**Código esperado (referencia):**
```javascript
// Al FINAL del index.js
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  
  if (err.message && err.message.includes('NOT_FOUND')) {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }
  
  return res.status(500).json({ error: 'Error interno del servidor' });
});
```

**Criterios de aceptación:**
- El middleware está al final de index.js
- Intercepta lanzamientos de Error del resto de la app
- Registra errores en consola
- Retorna respuestas HTTP apropiadas
- No expone información sensible

**Estimación:** 15 min
**Tags:** Backend, Errores, Robustez

---

### Ticket C2: Pruebas de validación y códigos HTTP
**Descripción:**
- Usar Postman, Thunder Client o curl
- Forzar errores e intencionadamente probar:

**Test 1: POST sin título**
```json
{ "prioridad": 2 }
```
Esperado: 400 Bad Request + mensaje de error

**Test 2: POST con título muy corto**
```json
{ "titulo": "ab" }
```
Esperado: 400 Bad Request

**Test 3: POST con prioridad inválida**
```json
{ "titulo": "Tarea", "prioridad": "extrema" }
```
Esperado: 400 Bad Request

**Test 4: GET de ID que no existe**
- GET `http://localhost:3000/api/v1/tasks/999999`
Esperado: 404 Not Found

**Test 5: DELETE de ID que no existe**
- DELETE `http://localhost:3000/api/v1/tasks/999999`
Esperado: 404 Not Found

**Test 6: PATCH con título vacío**
- PATCH `http://localhost:3000/api/v1/tasks/1` con `{ "titulo": "" }`
Esperado: 400 Bad Request

**Criterios de aceptación:**
- Todos los 6 tests ejecutados
- Se documenta en Postman/Thunder Client cada resultado
- Los códigos HTTP son correctos (400, 404, 500)
- No hay errores no controlados (500 inesperados)

**Estimación:** 30 min
**Tags:** Testing, QA, Validación

---

### Ticket C3: Crear y documentar colección en Postman/Thunder Client
**Descripción:**
- Exportar la colección de pruebas en Postman o Thunder Client como JSON
- Guardar en `/server/docs/api-collection.json` (crear carpeta docs si no existe)
- Crear archivo `/server/docs/API_TESTING.md` que documente:
  - Cómo importar la colección
  - Qué endpoint testea cada request
  - Códigos HTTP esperados
  - Errores comunes y cómo reproducirlos

**Criterios de aceptación:**
- Existe archivo de colección JSON
- Existe documentación en Markdown
- Se puede importar la colección fácilmente
- Están documentados casos de error

**Estimación:** 20 min
**Tags:** Testing, Documentación, API

---
      
## FASE D: Transparencia de Red y Consumo desde Frontend

### Ticket D1: Crear módulo cliente HTTP (api client)
**Descripción:**
- Crear directorio `/docs/ai/api` (al lado de app.js)
- Crear archivo `/docs/ai/api/client.js`
- Este archivo es la CAPA de comunicación HTTP del frontend
- Definir constante: `const API_URL = 'http://localhost:3000/api/v1/tasks';`
- Implementar 5 funciones asíncronas (async/await):

1. **async obtenerTodas()**
   ```javascript
   const response = await fetch(`${API_URL}`);
   if (!response.ok) throw new Error(`HTTP ${response.status}`);
   return response.json();
   ```

2. **async crearTarea(titulo, prioridad)**
   ```javascript
   const response = await fetch(`${API_URL}`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ titulo, prioridad })
   });
   if (!response.ok) throw new Error(await response.text());
   return response.json();
   ```

3. **async obtenerPorId(id)**

4. **async actualizarTarea(id, data)**
   - Usa método PATCH

5. **async eliminarTarea(id)**
   - Usa método DELETE
   - No espera JSON en respuesta (204)

**Notas importantes:**
- Cada función maneja la lógica HTTP pura
- Se lanza Error si response no es OK
- El frontend lo usará para reemplazar llamadas a localStorage

**Criterios de aceptación:**
- Existe `/docs/ai/api/client.js`
- Contiene las 5 funciones async
- Usa fetch nativo
- Maneja respuestas HTTP correctamente

**Estimación:** 20 min
**Tags:** Frontend, API Client, HTTP

---

### Ticket D2: Refactorizar app.js - Reemplazar localStorage por fetch
**Descripción:**
- Abrir `/docs/ai/app.js`
- ELIMINAR todas las referencias a `localStorage` (guardarEnStorage, cargarTareasDesdeStorage, guardarTema, STORAGE_KEY)
- REEMPLAZAR por llamadas al cliente HTTP:
  - Donde se lee tareas desde storage → llamar `apiClient.obtenerTodas()`
  - Donde se guarda nueva tarea → llamar `apiClient.crearTarea(titulo, prioridad)`
  - Donde se marca completada → llamar `apiClient.actualizarTarea(id, data)`
  - Donde se borra → llamar `apiClient.eliminarTarea(id)`
- Importar client en app.js: `const apiClient = require('./api/client');` (ajustar path según estructura)

**Criterios de aceptación:**
- NO hay references a localStorage
- NO hay STORAGE_KEY, guardarEnStorage, etc.
- El app.js importa y usa apiClient
- La UI sigue funcionando (ahora contra servidor)

**Estimación:** 30 min
**Tags:** Frontend, Refactorización, API

---

### Ticket D3: Implementar estados de carga y error en UI
**Descripción:**
- Modificar `/docs/ai/app.js` para mostrar visualmente:

1. **Estado de carga**: Mientras una petición HTTP viaja
   - Deshabilitar botones de interacción
   - Mostrar indicador visual (texto "Cargando..." o spinner)

2. **Estado de éxito**: Cuando la respuesta es OK
   - Renderizar tareas normalmente
   - Actualizar contador

3. **Estado de error**: Cuando servidor retorna error o se cae
   - Mostrar mensaje de error derivado del servidor
   - Permitir al usuario reintentar
   - NO crashear la app

**Ejemplo de implementación:**
```javascript
const crearTarea = async () => {
  try {
    mostrarCargando(true);
    const nuevaTarea = await apiClient.crearTarea(titulo);
    mostrarTareaEnHtml(nuevaTarea);
  } catch (error) {
    mostrarError(`Error: ${error.message}`);
  } finally {
    mostrarCargando(false);
  }
};

function mostrarCargando(activo) {
  // Deshabilitar/habilitar botones
  document.querySelectorAll('button').forEach(btn => btn.disabled = activo);
  // Mostrar/ocultar spinner
}

function mostrarError(mensaje) {
  alert(mensaje); // O mejor, mostrar en div dedicado
}
```

**Criterios de aceptación:**
- Durante peticiones HTTP, la UI indica que está cargando
- Si hay error, se muestra mensaje comprensible al usuario
- Los 3 estados (carga, éxito, error) son visibles
- La app no se bloquea

**Estimación:** 25 min
**Tags:** Frontend, UX, Estados

---

### Ticket D4: Probar integración frontend-backend
**Descripción:**
- Arrancar servidor: `npm run dev` (en carpeta server/)
- Abrir `http://localhost:3000` ← WAIT, esto es el servidor
- Abrir el HTML del frontend: `file:///C:/Users/laura/Documents/proyecto/taskflow-ia/docs/ai/index.html`
- Probar operaciones:
  1. Crear nueva tarea → debe aparecer desde servidor
  2. Completar tarea → debe actualizarse en servidor
  3. Eliminar tarea → debe removerse del servidor
  4. Recargar página → las tareas persisten (en memoria del servidor)
  5. Desconectar servidor y intentar operación → error visible

**Criterios de aceptación:**
- Frontend se comunica exitosamente con backend
- Crear/actualizar/eliminar funcionan contra servidor
- Los estados de carga se ven
- Los errores se manejan gracefully

**Estimación:** 20 min
**Tags:** Testing, Integración

---

### Ticket D5: Crear archivo de documentación - README.md
**Descripción:**
- En la raíz del proyecto (o en /server), crear `/README.md`
- Documentar:

**Sección 1: Descripción general**
- ¿Qué es TaskFlow?
- Stack tecnológico (Express, Node.js, vanilla JS frontend)

**Sección 2: Instalación y ejecución**
- Pasos para clonar el repo
- Instalar dependencias (npm install en server/)
- Crear .env con PORT
- Ejecutar `npm run dev`

**Sección 3: Arquitectura del backend**
- Explicar las 3 capas: routes → controllers → services
- Justificar por qué se separan
- Diagram (ASCII art) de flujo de petición

**Ejemplo ASCII:**
```
Cliente (fetch) 
    ↓
GET /api/v1/tasks
    ↓
[Router] Mapea verbo HTTP
    ↓
[Controlador] Valida entrada, llama service
    ↓
[Servicio] Lógica pura, retorna datos
    ↓
[Controlador] Formatea respuesta HTTP
    ↓
JSON 200 OK
```

**Sección 4: Ejemplos de request/response**
```
1. Crear tarea:
POST /api/v1/tasks
Content-Type: application/json

{
  "titulo": "Aprender backend",
  "prioridad": 2
}

Respuesta 201:
{
  "id": 1234567890,
  "titulo": "Aprender backend",
  "prioridad": 2,
  "completada": false
}

---

2. Obtener todas:
GET /api/v1/tasks

Respuesta 200:
[
  { "id": ..., "titulo": ..., ... },
  { "id": ..., "titulo": ..., ... }
]

---

3. Eliminar:
DELETE /api/v1/tasks/1234567890

Respuesta 204 (sin cuerpo)
```

**Sección 5: Códigos HTTP utilizados**
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 404 Not Found
- 500 Internal Server Error

**Criterios de aceptación:**
- Existe `/README.md`
- Explica claramente arquitectura y pasos de ejecución
- Incluye ejemplos de request/response
- Es comprensible para otro desarrollador

**Estimación:** 30 min
**Tags:** Documentación

---

### Ticket D6: Crear documento - Herramientas (Axios, Postman, Sentry, Swagger)
**Descripción:**
- Crear archivo `/docs/HERRAMIENTAS_BACKEND.md` en la raíz del proyecto (o en docs/)
- Documentar CADA herramienta que aparece en teoría + ejemplos pequeños:

**1. Axios**
- ¿Qué es? Cliente HTTP alternativo a fetch
- Ventajas sobre fetch (interceptores, cancelación, defaults)
- Ejemplo de uso:
  ```javascript
  const axios = require('axios');
  axios.post('http://localhost:3000/api/v1/tasks', {
    titulo: 'Mi tarea'
  });
  ```

**2. Postman**
- ¿Qué es? GUI para probar APIs
- Cómo descargar e instalar
- Cómo crear colección y guardarla JSON
- Por qué es estándar en industria

**3. Thunder Client**
- ¿Qué es? Plugin VS Code alternativo a Postman (más ligero)
- Instalación desde marketplace VS Code
- Exportar/importar colecciones

**4. Sentry**
- ¿Qué es? Plataforma de monitoreo de errores en tiempo real
- Por qué importante en producción (alertas, tracking)
- Ejemplo básico de integración con Express

**5. Swagger / OpenAPI**
- ¿Qué es? Estándar para documentar APIs
- Herramientas: Swagger UI, Swagger Editor
- Beneficio: auto-generar cliente HTTP
- Ejemplo mínimo de spec OpenAPI

**Criterios de aceptación:**
- Existe `/docs/HERRAMIENTAS_BACKEND.md`
- Explica cada herramienta con propósito y ejemplo
- Incluye referencias a documentación oficial

**Estimación:** 25 min
**Tags:** Documentación, Herramientas

---

## FASE BONUS: Documentación Exhaustiva con Swagger

### Ticket BONUS1: Instalar y configurar Swagger en Express
**Descripción:**
- En `/server`, instalar: `npm install swagger-jsdoc swagger-ui-express`
- Crear archivo `/server/src/config/swagger.js` que:
  1. Defina especificación OpenAPI en formato JSON/YAML
  2. Configure endpoint `/api-docs` que sirva Swagger UI
  3. Documente todos los 5 endpoints (GET, POST, GET :id, PATCH :id, DELETE :id)
  4. Incluya ejemplos de request/response para cada uno

**Criterios de aceptación:**
- Swagger instalado correctamente
- Accesible en `http://localhost:3000/api-docs`
- Documenta los 5 endpoints con ejemplos
- Se puede ejecutar pruebas desde Swagger UI

**Estimación:** 40 min
**Tags:** Documentación, Swagger, API

---

### Ticket BONUS2: Pruebas exhaustivas con Postman/Thunder Client
**Descripción:**
- Crear colección "TaskFlow API Complete" en Postman/Thunder Client
- Incluir carpetas por operación:
  - Create (1 test de éxito + 4 de error)
  - Read (éxito + ID no existe)
  - Update (éxito + ID no existe + validación falla)
  - Delete (éxito + ID no existe)
- Exportar colección como JSON a `/server/tests/postman-collection.json`
- Crear script de pre-request y tests para automatizar validaciones

**Criterios de aceptación:**
- Colección exportada
- Mínimo 10 requests de prueba
- Incluye validaciones automáticas (test scripts)
- Cubre casos de éxito y error

**Estimación:** 45 min
**Tags:** Testing, QA, Postman

---

### Ticket BONUS3: README con ejemplos exhaustivos de request/response
**Descripción:**
- Actualizar `/README.md` con nueva sección "API Reference Completa"
- Para CADA endpoint, documentar:
  - Descripción clara
  - Método HTTP y ruta exacta
  - Parámetros (path, query, body)
  - Respuesta exitosa (código + JSON)
  - Errores posibles (códigos + JSON)
  - cURL ejemplo

**Ejemplo para POST /api/v1/tasks:**
```
### Crear Nueva Tarea

**Descripción:** Crea una tarea nueva.

**Método:** POST
**URL:** /api/v1/tasks
**Content-Type:** application/json

#### Request Body
```json
{
  "titulo": "string (requerido, 3-120 caracteres)",
  "prioridad": "number (opcional, 1-3, default 2)"
}
```

#### Response 201 Created
```json
{
  "id": 1710963840000,
  "titulo": "Leer documentación de Express",
  "prioridad": 2,
  "completada": false
}
```

#### Error 400 Bad Request
```json
{
  "error": "El título es obligatorio y debe tener entre 3 y 120 caracteres"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi tarea","prioridad":2}'
```
```

**Criterios de aceptación:**
- README actualizado con 5 endpoints documenta
  - Cada uno con descripción, método, parámetros
  - Ejemplos de éxito y error
  - Ejemplo cURL

**Estimación:** 30 min
**Tags:** Documentación, API

---

## RESUMEN DE TICKETS

| # | Ticket | Fase | Estimación | Status |
|---|--------|------|------------|--------|
| A1 | Inicialización proyecto Node | A | 5min | ⬜ |
| A2 | Instalar dependencias prod | A | 5min | ⬜ |
| A3 | Instalar dependencias dev | A | 5min | ⬜ |
| A4 | Crear .env | A | 5min | ⬜ |
| A5 | Actualizar .gitignore | A | 5min | ⬜ |
| A6 | Módulo configuración env.js | A | 10min | ⬜ |
| A7 | Crear index.js servidor | A | 10min | ⬜ |
| A8 | Scripts npm en package.json | A | 5min | ⬜ |
| A9 | Prueba arranque servidor | A | 10min | ⬜ |
| B1 | Capa servicios (task.service.js) | B | 20min | ⬜ |
| B2 | Capa controladores (task.controller.js) | B | 30min | ⬜ |
| B3 | Capa rutas (task.routes.js) | B | 15min | ⬜ |
| B4 | Montar router en index.js | B | 10min | ⬜ |
| B5 | Prueba manual API CRUD | B | 20min | ⬜ |
| C1 | Middleware manejo errores | C | 15min | ⬜ |
| C2 | Pruebas validación y códigos HTTP | C | 30min | ⬜ |
| C3 | Colección Postman/Thunder | C | 20min | ⬜ |
| D1 | Módulo cliente HTTP (api/client.js) | D | 20min | ⬜ |
| D2 | Refactorizar app.js remover localStorage | D | 30min | ⬜ |
| D3 | Estados carga y error en UI | D | 25min | ⬜ |
| D4 | Prueba integración frontend-backend | D | 20min | ⬜ |
| D5 | README.md con arquitectura | D | 30min | ⬜ |
| D6 | Documento herramientas | D | 25min | ⬜ |
| BONUS1 | Swagger configuración | BONUS | 40min | ⬜ |
| BONUS2 | Postman pruebas exhaustivas | BONUS | 45min | ⬜ |
| BONUS3 | README API reference | BONUS | 30min | ⬜ |

**Total Estimado:** ~525 minutos ≈ 8.75 horas (sin bonus)
**Con Bonus:** ~640 minutos ≈ 10.67 horas

---

## Estructura Final de Carpetas (Referencia)

```
taskflow-ia/
├── docs/
│   └── ai/
│       ├── index.html
│       ├── app.js (refactorizado)
│       ├── sytle.css
│       └── api/
│           └── client.js (NUEVO)
│       
├── server/
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   └── swagger.js (BONUS)
│   │   ├── routes/
│   │   │   └── task.routes.js
│   │   ├── controllers/
│   │   │   └── task.controller.js
│   │   └── services/
│   │       └── task.service.js
│   │
│   ├── docs/
│   │   ├── API_TESTING.md
│   │   └── api-collection.json
│   │
│   ├── tests/
│   │   └── postman-collection.json (BONUS)
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules/
│
├── README.md (raíz)
├── HERRAMIENTAS_BACKEND.md
├── .gitignore (actualizado)
└── [otros archivos existentes]
```

---

## Notas Importantes

- **No modifiques código aún**: Este documento es tu guía paso a paso
- **Sigue el orden**: Las fases A → B → C → D tienen dependencias lógicas
- **Prueba cada ticket**: Verifica que el estado esperado se cumple antes de avanzar
- **Usa Git**: Commitea después de cada fase completada
- **Documenta decisiones**: Si haces algo diferente, actualiza este documento

---

**Última actualización:** 23/03/2026
**Estado:** Listo para empezar Fase A
