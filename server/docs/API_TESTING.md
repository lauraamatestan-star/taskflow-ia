# API Testing - TaskFlow

## Archivos incluidos
- Coleccion: `server/docs/api-collection.json`
- Esta guia: `server/docs/API_TESTING.md`

## Como importar la coleccion

### Postman
1. Abre Postman.
2. Click en Import.
3. Selecciona el archivo `server/docs/api-collection.json`.
4. Verifica que aparece la coleccion "TaskFlow API - CRUD y Validaciones".

### Thunder Client (VS Code)
1. Abre Thunder Client en VS Code.
2. Ve a Collections.
3. Usa Import Collection.
4. Selecciona `server/docs/api-collection.json`.

## Variables de la coleccion
- `baseUrl`: `http://localhost:3000`
- `taskId`: id de tarea para pruebas CRUD (debes actualizarlo luego de crear una tarea)

## Endpoints cubiertos

### Health
- `GET /`
- Esperado: `200 OK`

### CRUD principal
- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

Codigos esperados:
- `POST` exitoso: `201 Created`
- `GET` exitoso: `200 OK`
- `PATCH` exitoso: `200 OK`
- `DELETE` exitoso: `204 No Content`

### Casos de validacion y error (C2)
1. POST sin titulo
- Request body: `{ "prioridad": 2 }`
- Esperado: `400 Bad Request`

2. POST con titulo corto
- Request body: `{ "titulo": "ab" }`
- Esperado: `400 Bad Request`

3. POST con prioridad invalida
- Request body: `{ "titulo": "Tarea", "prioridad": "extrema" }`
- Esperado: `400 Bad Request`

4. GET de id inexistente
- `GET /api/v1/tasks/999999`
- Esperado: `404 Not Found`

5. DELETE de id inexistente
- `DELETE /api/v1/tasks/999999`
- Esperado: `404 Not Found`

6. PATCH con titulo vacio
- `PATCH /api/v1/tasks/1` con `{ "titulo": "" }`
- Esperado: `400 Bad Request`

## Errores comunes y como reproducirlos

1. Servidor apagado
- Sintoma: timeout o connection refused.
- Como reproducir: no ejecutar `npm run dev`.
- Solucion: iniciar servidor en `server/` con `npm run dev`.

2. JSON mal formado
- Sintoma: `400` con error de parseo JSON.
- Como reproducir: enviar body como `{titulo: "x"}` (sin comillas en la clave).
- Solucion: usar JSON valido con comillas dobles en claves y strings.

3. Ruta incorrecta
- Sintoma: `404` en endpoint no esperado.
- Como reproducir: llamar `/api/tasks` en vez de `/api/v1/tasks`.
- Solucion: usar siempre el prefijo `/api/v1/tasks`.

4. ID no numerico
- Sintoma: `400` por validacion de id.
- Como reproducir: `GET /api/v1/tasks/abc`.
- Solucion: enviar ids numericos validos.

## Flujo recomendado de prueba
1. Ejecutar `npm run dev` en `server/`.
2. Ejecutar "Crear tarea" y guardar el `id` retornado.
3. Actualizar variable `taskId` con ese `id`.
4. Ejecutar GET por id, PATCH y DELETE.
5. Ejecutar carpeta "Validaciones y Errores" para confirmar codigos `400/404`.
