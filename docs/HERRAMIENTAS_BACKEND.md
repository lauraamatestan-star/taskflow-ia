# Herramientas Backend

Este documento resume herramientas utiles para desarrollo, pruebas, monitoreo y documentacion de APIs en proyectos como TaskFlow.

## 1. Axios

### Que es
Axios es un cliente HTTP para Node.js y navegador. Es una alternativa comun a fetch cuando se quieren utilidades extra desde el inicio.

### Ventajas sobre fetch
- Interceptores para request/response (ideal para auth y logs).
- Soporte de timeout y cancelacion mas simple.
- Manejo de JSON mas directo.
- Configuracion global de baseURL y headers por defecto.

### Ejemplo rapido
```javascript
const axios = require('axios');

axios.post('http://localhost:3000/api/v1/tasks', {
  titulo: 'Mi tarea'
});
```

### Documentacion oficial
- https://axios-http.com/docs/intro

---

## 2. Postman

### Que es
Postman es una aplicacion GUI para probar APIs sin escribir codigo cliente manual para cada prueba.

### Como descargar e instalar
- Ir al sitio oficial.
- Descargar para tu sistema operativo.
- Instalar y abrir la app.

### Como crear coleccion y exportar JSON
- Crear una Collection nueva.
- Guardar requests dentro de la coleccion.
- En menu de la coleccion, elegir Export.
- Guardar el archivo JSON en tu repositorio (por ejemplo, server/docs/api-collection.json).

### Por que es estandar en industria
- Facilita pruebas manuales rapidas.
- Comparte colecciones entre equipos.
- Permite scripts de test y variables de entorno.

### Documentacion oficial
- https://www.postman.com/downloads/
- https://learning.postman.com/docs/getting-started/introduction/

---

## 3. Thunder Client

### Que es
Thunder Client es una extension de VS Code para probar APIs de forma ligera, sin salir del editor.

### Instalacion en VS Code
- Abrir Extensions en VS Code.
- Buscar "Thunder Client".
- Instalar la extension.

### Exportar e importar colecciones
- Crear requests y colecciones dentro de la extension.
- Usar opcion Export para generar JSON.
- Usar opcion Import para cargar colecciones existentes.

### Cuando conviene
- Si prefieres un flujo rapido dentro de VS Code.
- Si no necesitas todas las funciones avanzadas de Postman.

### Documentacion oficial
- https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client

---

## 4. Sentry

### Que es
Sentry es una plataforma de monitoreo de errores en tiempo real para aplicaciones backend y frontend.

### Por que es importante en produccion
- Detecta errores automaticamente.
- Agrupa problemas repetidos.
- Muestra stack traces y contexto para depurar.
- Permite alertas para reaccionar rapido.

### Ejemplo basico en Express
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN
});

app.use(Sentry.Handlers.requestHandler());

// ... tus rutas

app.use(Sentry.Handlers.errorHandler());
```

### Documentacion oficial
- https://docs.sentry.io/platforms/javascript/guides/express/

---

## 5. Swagger / OpenAPI

### Que es
OpenAPI es un estandar para describir APIs REST. Swagger es un ecosistema de herramientas para trabajar con esa especificacion.

### Herramientas comunes
- Swagger UI: interfaz web para explorar y probar endpoints.
- Swagger Editor: editor para escribir y validar especificaciones OpenAPI.

### Beneficio principal
Permite documentar API de forma consistente y, en muchos casos, auto-generar clientes HTTP y SDKs.

### Ejemplo minimo de spec OpenAPI
```yaml
openapi: 3.0.3
info:
  title: TaskFlow API
  version: 1.0.0
paths:
  /api/v1/tasks:
    get:
      summary: Obtener todas las tareas
      responses:
        '200':
          description: Lista de tareas
```

### Documentacion oficial
- https://swagger.io/tools/swagger-ui/
- https://editor.swagger.io/
- https://spec.openapis.org/oas/latest.html

---

## Recomendacion practica para TaskFlow

- Desarrollo diario: Thunder Client o Postman.
- Documentacion tecnica: OpenAPI + Swagger UI.
- Monitoreo en produccion: Sentry.
- Cliente programatico con configuracion centralizada: Axios (si fetch no alcanza).
