const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'API REST para gestión de tareas. Permite crear, leer, actualizar y eliminar tareas.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        Tarea: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Identificador único generado automáticamente',
              example: 1710963840000,
            },
            titulo: {
              type: 'string',
              description: 'Texto descriptivo de la tarea (3-120 caracteres)',
              example: 'Aprender Express',
            },
            prioridad: {
              type: 'number',
              description: 'Nivel de prioridad: 1 (baja), 2 (media), 3 (alta)',
              example: 2,
            },
            completada: {
              type: 'boolean',
              description: 'Estado de completado de la tarea',
              example: false,
            },
          },
        },
        NuevaTarea: {
          type: 'object',
          required: ['titulo'],
          properties: {
            titulo: {
              type: 'string',
              minLength: 3,
              maxLength: 120,
              description: 'Texto de la tarea (obligatorio, 3-120 caracteres)',
              example: 'Aprender Express',
            },
            prioridad: {
              type: 'number',
              minimum: 1,
              maximum: 3,
              description: 'Nivel de prioridad 1-3 (opcional, default 2)',
              example: 2,
            },
          },
        },
        ActualizarTarea: {
          type: 'object',
          properties: {
            titulo: {
              type: 'string',
              minLength: 3,
              maxLength: 120,
              description: 'Nuevo texto de la tarea',
              example: 'Aprender Express y Node.js',
            },
            prioridad: {
              type: 'number',
              minimum: 1,
              maximum: 3,
              description: 'Nuevo nivel de prioridad',
              example: 3,
            },
            completada: {
              type: 'boolean',
              description: 'Nuevo estado de completado',
              example: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje descriptivo del error',
              example: 'Tarea no encontrada',
            },
          },
        },
      },
    },
    paths: {
      '/api/v1/tasks': {
        get: {
          summary: 'Obtener todas las tareas',
          description: 'Retorna el listado completo de tareas almacenadas en el servidor.',
          tags: ['Tareas'],
          responses: {
            200: {
              description: 'Lista de tareas obtenida correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Tarea' },
                  },
                  example: [
                    { id: 1710963840000, titulo: 'Aprender Express', prioridad: 2, completada: false },
                    { id: 1710963850000, titulo: 'Leer documentación', prioridad: 1, completada: true },
                  ],
                },
              },
            },
          },
        },
        post: {
          summary: 'Crear una nueva tarea',
          description: 'Crea una tarea nueva con título y prioridad opcionales. El ID se genera automáticamente.',
          tags: ['Tareas'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NuevaTarea' },
                example: {
                  titulo: 'Aprender Express',
                  prioridad: 2,
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Tarea creada correctamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Tarea' },
                  example: {
                    id: 1710963840000,
                    titulo: 'Aprender Express',
                    prioridad: 2,
                    completada: false,
                  },
                },
              },
            },
            400: {
              description: 'Datos de entrada inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  examples: {
                    sinTitulo: {
                      summary: 'Título ausente',
                      value: { error: 'El título es obligatorio y debe tener entre 3 y 120 caracteres' },
                    },
                    tituloCort: {
                      summary: 'Título muy corto',
                      value: { error: 'El título es obligatorio y debe tener entre 3 y 120 caracteres' },
                    },
                    prioridadInvalida: {
                      summary: 'Prioridad fuera de rango',
                      value: { error: 'La prioridad debe ser un número entre 1 y 3' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/tasks/{id}': {
        get: {
          summary: 'Obtener una tarea por ID',
          description: 'Retorna una tarea específica según su ID numérico.',
          tags: ['Tareas'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID numérico de la tarea',
              schema: { type: 'number', example: 1710963840000 },
            },
          ],
          responses: {
            200: {
              description: 'Tarea encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Tarea' },
                  example: {
                    id: 1710963840000,
                    titulo: 'Aprender Express',
                    prioridad: 2,
                    completada: false,
                  },
                },
              },
            },
            400: {
              description: 'ID no válido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { error: 'El ID debe ser un número válido' },
                },
              },
            },
            404: {
              description: 'Tarea no encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { error: 'Tarea no encontrada' },
                },
              },
            },
          },
        },
        patch: {
          summary: 'Actualizar una tarea',
          description: 'Actualiza parcialmente una tarea existente. Solo se modifican los campos enviados.',
          tags: ['Tareas'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID numérico de la tarea a actualizar',
              schema: { type: 'number', example: 1710963840000 },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActualizarTarea' },
                examples: {
                  marcarCompletada: {
                    summary: 'Marcar como completada',
                    value: { completada: true },
                  },
                  cambiarTitulo: {
                    summary: 'Cambiar título',
                    value: { titulo: 'Nuevo título de la tarea' },
                  },
                  actualizacionCompleta: {
                    summary: 'Actualización completa',
                    value: { titulo: 'Título actualizado', prioridad: 3, completada: true },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Tarea actualizada correctamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Tarea' },
                  example: {
                    id: 1710963840000,
                    titulo: 'Aprender Express y Node.js',
                    prioridad: 3,
                    completada: true,
                  },
                },
              },
            },
            400: {
              description: 'Datos de actualización inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { error: 'El título debe tener entre 3 y 120 caracteres' },
                },
              },
            },
            404: {
              description: 'Tarea no encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { error: 'Tarea no encontrada' },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Eliminar una tarea',
          description: 'Elimina permanentemente una tarea según su ID. No retorna contenido en caso de éxito.',
          tags: ['Tareas'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID numérico de la tarea a eliminar',
              schema: { type: 'number', example: 1710963840000 },
            },
          ],
          responses: {
            204: {
              description: 'Tarea eliminada correctamente (sin contenido)',
            },
            404: {
              description: 'Tarea no encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { error: 'Tarea no encontrada' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
