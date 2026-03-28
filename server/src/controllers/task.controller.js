const taskService = require('../services/task.service');

function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('El id debe ser numérico y mayor a 0');
  }
  return id;
}

function validarTitulo(titulo) {
  if (typeof titulo !== 'string') {
    throw new Error('El título debe ser un texto');
  }

  const tituloLimpio = titulo.trim();
  if (tituloLimpio.length < 3 || tituloLimpio.length > 120) {
    throw new Error('El título debe tener entre 3 y 120 caracteres');
  }

  return tituloLimpio;
}

function validarPrioridad(prioridad) {
  if (!Number.isInteger(prioridad) || prioridad < 1 || prioridad > 3) {
    throw new Error('La prioridad debe ser un número entre 1 y 3');
  }
  return prioridad;
}

function obtenerTodas(req, res) {
  const tareas = taskService.obtenerTodas();
  return res.status(200).json(tareas);
}

function obtenerPorId(req, res) {
  try {
    const id = parseId(req.params.id);
    const tarea = taskService.obtenerPorId(id);
    return res.status(200).json(tarea);
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    return res.status(400).json({ error: error.message });
  }
}

function crearTarea(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'El body es obligatorio' });
    }

    const titulo = validarTitulo(req.body.titulo);
    const prioridad = req.body.prioridad === undefined ? 2 : validarPrioridad(req.body.prioridad);

    const tarea = taskService.crearTarea({
      titulo,
      prioridad,
      completada: req.body.completada === true
    });

    return res.status(201).json(tarea);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

function actualizarTarea(req, res) {
  try {
    const id = parseId(req.params.id);

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'El body es obligatorio' });
    }

    const data = {};

    if (req.body.titulo !== undefined) {
      data.titulo = validarTitulo(req.body.titulo);
    }

    if (req.body.prioridad !== undefined) {
      data.prioridad = validarPrioridad(req.body.prioridad);
    }

    if (req.body.completada !== undefined) {
      if (typeof req.body.completada !== 'boolean') {
        return res.status(400).json({ error: 'El campo completada debe ser booleano' });
      }
      data.completada = req.body.completada;
    }

    const tarea = taskService.actualizarTarea(id, data);
    return res.status(200).json(tarea);
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    return res.status(400).json({ error: error.message });
  }
}

function eliminarTarea(req, res) {
  try {
    const id = parseId(req.params.id);
    taskService.eliminarTarea(id);
    return res.status(204).send();
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crearTarea,
  actualizarTarea,
  eliminarTarea
};