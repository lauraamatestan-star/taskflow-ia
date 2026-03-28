let tasks = [];

function obtenerTodas() {
  return [...tasks];
}

function obtenerPorId(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) {
    throw new Error('NOT_FOUND');
  }
  return task;
}

function crearTarea(data) {
  const id = Date.now();
  const newTask = {
    id,
    titulo: data.titulo,
    prioridad: data.prioridad || 2,
    completada: data.completada || false
  };
  tasks.push(newTask);
  return newTask;
}

function actualizarTarea(id, data) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('NOT_FOUND');
  }
  tasks[index] = { ...tasks[index], ...data };
  return tasks[index];
}

function eliminarTarea(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('NOT_FOUND');
  }
  tasks.splice(index, 1);
}

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crearTarea,
  actualizarTarea,
  eliminarTarea
};