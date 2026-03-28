const API_URL = 'http://localhost:3000/api/v1/tasks';

async function obtenerTodas() {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function crearTarea(titulo, prioridad) {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, prioridad })
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function obtenerPorId(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function actualizarTarea(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function eliminarTarea(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) throw new Error(await response.text());
}

const apiClient = {
  API_URL,
  obtenerTodas,
  crearTarea,
  obtenerPorId,
  actualizarTarea,
  eliminarTarea
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiClient;
}

if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
}
