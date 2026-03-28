let apiClientRef = null;

try {
  if (typeof require === "function") {
    apiClientRef = require("./api/client");
  }
} catch (error) {
  // Si require existe pero falla en navegador, usamos window.apiClient.
}

if (!apiClientRef && typeof window !== "undefined") {
  apiClientRef = window.apiClient;
}

window.addEventListener("load", () => {
  const MAX_LONGITUD_TAREA = 120;
  const PRIORIDAD_DEFAULT = 2;

  const formCrearTarea = document.getElementById("form-crear");
  const listaDeTareas = document.getElementById("lista-tareas");
  const inputNuevaTarea = document.getElementById("crear");
  const inputBuscarTarea = document.getElementById("buscar");
  const selectOrden = document.getElementById("ordenar");
  const btnToggleTema = document.getElementById("toggle-tema");
  let solicitudesActivas = 0;
  let estadoUi = null;
  let estadoMensaje = null;
  let estadoReintentar = null;
  let accionReintento = null;

  /**
   * Aplica el tema (claro u oscuro) al documento.
   *
   * @param {'light'|'dark'} tema Tema a aplicar.
   */
  const aplicarTema = (tema) => {
    document.body.classList.toggle("dark", tema === "dark");
    if (btnToggleTema) {
      btnToggleTema.textContent = tema === "dark" ? "Modo Claro" : "Modo Oscuro";
    }
  };

  /**
   * Crea el contenedor visual de estados de la app.
   */
  const inicializarEstadoUi = () => {
    if (!formCrearTarea) return;

    estadoUi = document.createElement("div");
    estadoUi.id = "estado-ui";
    estadoUi.className = "estado-ui oculto";

    estadoMensaje = document.createElement("span");
    estadoMensaje.id = "estado-mensaje";

    estadoReintentar = document.createElement("button");
    estadoReintentar.id = "estado-reintentar";
    estadoReintentar.type = "button";
    estadoReintentar.textContent = "Reintentar";
    estadoReintentar.className = "estado-reintentar oculto";

    estadoReintentar.addEventListener("click", async () => {
      if (typeof accionReintento !== "function") return;
      await accionReintento();
    });

    estadoUi.appendChild(estadoMensaje);
    estadoUi.appendChild(estadoReintentar);
    formCrearTarea.insertAdjacentElement("afterend", estadoUi);
  };

  const ocultarEstado = () => {
    if (!estadoUi) return;
    estadoUi.className = "estado-ui oculto";
    estadoMensaje.textContent = "";
    estadoReintentar.className = "estado-reintentar oculto";
    accionReintento = null;
  };

  const mostrarEstado = (tipo, mensaje, permitirReintento = false, onRetry = null) => {
    if (!estadoUi) return;
    estadoUi.className = `estado-ui ${tipo}`;
    estadoMensaje.textContent = mensaje;

    if (permitirReintento && typeof onRetry === "function") {
      accionReintento = onRetry;
      estadoReintentar.className = "estado-reintentar";
    } else {
      accionReintento = null;
      estadoReintentar.className = "estado-reintentar oculto";
    }
  };

  const habilitarInteracciones = (habilitado) => {
    const botonesBloqueables = document.querySelectorAll(
      ".boton-crear, #filtro-completadas, #filtro-todas, #filtro-pendientes"
    );
    botonesBloqueables.forEach((boton) => {
      boton.disabled = !habilitado;
    });

    if (inputNuevaTarea) inputNuevaTarea.disabled = !habilitado;
    if (inputBuscarTarea) inputBuscarTarea.disabled = !habilitado;
    if (selectOrden) selectOrden.disabled = !habilitado;

    if (listaDeTareas) {
      listaDeTareas.style.pointerEvents = habilitado ? "auto" : "none";
      listaDeTareas.style.opacity = habilitado ? "1" : "0.7";
    }
  };

  const mostrarCargando = (activo, mensaje = "Cargando...") => {
    if (activo) {
      solicitudesActivas += 1;
      mostrarEstado("cargando", mensaje);
      habilitarInteracciones(false);
      return;
    }

    solicitudesActivas = Math.max(0, solicitudesActivas - 1);
    if (solicitudesActivas === 0) {
      habilitarInteracciones(true);
    }
  };

  const mostrarExito = (mensaje) => {
    mostrarEstado("exito", mensaje);
    setTimeout(() => {
      if (estadoUi && estadoUi.classList.contains("exito")) {
        ocultarEstado();
      }
    }, 1800);
  };

  const mostrarError = (mensaje, onRetry = null) => {
    mostrarEstado("error", mensaje, Boolean(onRetry), onRetry);
  };

  /**
   * Valida el texto de una tarea.
   *
   * @param {string} textoBruto Texto ingresado por el usuario.
   * @returns {{valido: boolean, texto?: string, mensaje?: string}}
   *   - valido: true si el texto cumple reglas.
   *   - texto: texto limpio si es válido.
   *   - mensaje: mensaje de error si no es válido.
   */
  const validarTextoTarea = (textoBruto) => {
    const texto = textoBruto.trim();
    if (!texto) return { valido: false, mensaje: "Debe ingresar alguna tarea." };
    if (texto.length > MAX_LONGITUD_TAREA)
      return {
        valido: false,
        mensaje: `La tarea no puede tener más de ${MAX_LONGITUD_TAREA} caracteres.`,
      };
    return { valido: true, texto };
  };

  /**
   * Comprueba si ya existe una tarea con el mismo texto (sin distinguir mayúsculas).
   *
   * @param {string} texto Texto normalizado de la tarea.
   * @returns {boolean} true si ya existe una tarea con el mismo texto.
   */
  const esTareaDuplicada = (texto) => {
    const tareasExistentes = Array.from(listaDeTareas.querySelectorAll("li strong")).map(
      (strong) => strong.textContent.toLowerCase()
    );
    return tareasExistentes.includes(texto.toLowerCase());
  };

  /**
   * Crea la estructura DOM de una tarea.
   *
   * @param {{id:number|string,titulo:string,completada:boolean}} tarea Datos de la tarea.
   * @returns {HTMLLIElement} Elemento <li> ya listo para insertarse en la lista.
   */
  const crearElementoTarea = (tarea) => {
    const li = document.createElement("li");
    li.dataset.id = String(tarea.id);

    const strong = document.createElement("strong");
    strong.className = tarea.completada ? "completada-texto" : "";
    strong.textContent = tarea.titulo;

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const tick = document.createElement("i");
    tick.className = `fa-solid fa-check btn-tick ${tarea.completada ? "completada" : ""}`;

    const trash = document.createElement("i");
    trash.className = "fa-solid fa-trash-can borrar";

    acciones.appendChild(tick);
    acciones.appendChild(trash);

    li.appendChild(strong);
    li.appendChild(acciones);
    return li;
  };

  /**
   * Comprueba si una tarea está marcada como completada.
   *
   * @param {HTMLLIElement} tareaElemento Elemento <li> que contiene la tarea.
   * @returns {boolean} true si la tarea está marcada como completada.
   */
  const obtenerEstadoCompletado = (tareaElemento) =>
    tareaElemento.querySelector(".btn-tick").classList.contains("completada");

  /**
   * Agrega una tarea al DOM y actualiza el estado de la app.
   *
   * @param {{id:number|string,titulo:string,completada:boolean}} tarea Tarea a renderizar.
   */
  const mostrarTareaEnHtml = (tarea) => {
    const tareaElemento = crearElementoTarea(tarea);

    // Si el criterio es "Más nuevas", añadimos las tareas al inicio.
    if (selectOrden?.value === "mas-nuevas") {
      listaDeTareas.prepend(tareaElemento);
    } else {
      listaDeTareas.appendChild(tareaElemento);
    }

    actualizarRecuentoTareas();

    // Ordena cuando la opción seleccionada no depende del orden de inserción.
    if (selectOrden && selectOrden.value !== "mas-nuevas") {
      ordenarTareas(selectOrden.value);
    }
  };

  /**
   * Pide las tareas al backend y las renderiza.
   */
  const cargarTareasDesdeApi = async () => {
    const tareas = await apiClientRef.obtenerTodas();
    listaDeTareas.innerHTML = "";
    tareas.forEach((tarea) => mostrarTareaEnHtml(tarea));
  };

  const cargarTareasConEstado = async () => {
    mostrarCargando(true, "Cargando tareas...");
    try {
      await cargarTareasDesdeApi();
      actualizarRecuentoTareas();
      mostrarExito("Tareas cargadas correctamente.");
    } catch (error) {
      mostrarError(`No se pudieron cargar las tareas: ${error.message}`, cargarTareasConEstado);
    } finally {
      mostrarCargando(false);
    }
  };

  /**
   * Captura el valor del input de nueva tarea y lo agrega si es válido.
   *
   * - Valida que el texto no esté vacío ni exceda la longitud máxima.
   * - Evita duplicados.
   * - Muestra mensajes de alerta si hay errores.
   */
  const capturarValorTarea = async () => {
    const { valido, texto, mensaje } = validarTextoTarea(inputNuevaTarea.value);
    if (!valido) {
      mostrarError(mensaje);
      return;
    }

    if (esTareaDuplicada(texto)) {
      mostrarError("Esa tarea ya existe.");
      return;
    }

    mostrarCargando(true, "Creando tarea...");
    try {
      const nuevaTarea = await apiClientRef.crearTarea(texto, PRIORIDAD_DEFAULT);
      mostrarTareaEnHtml(nuevaTarea);
      inputNuevaTarea.value = "";
      mostrarExito("Tarea creada correctamente.");
    } catch (error) {
      mostrarError(`No se pudo crear la tarea: ${error.message}`);
    } finally {
      mostrarCargando(false);
    }
  };

  /**
   * Filtra las tareas visibles según el tipo (todos/finalizado/pendiente).
   *
   * @param {'todos'|'finalizado'|'pendiente'} tipo Tipo de filtro.
   */
  const filtrar = (tipo) => {
    const tareasEnLista = Array.from(listaDeTareas.querySelectorAll("li"));

    tareasEnLista.forEach((tareaElemento) => {
      const tareaEstaCompletada = obtenerEstadoCompletado(tareaElemento);

      const debeMostrar =
        tipo === "todos" ||
        (tipo === "finalizado" && tareaEstaCompletada) ||
        (tipo === "pendiente" && !tareaEstaCompletada);

      tareaElemento.style.display = debeMostrar ? "flex" : "none";
    });
  };

  /**
   * Reordena las tareas actualmente renderizadas en la UI.
   *
   * El orden se aplica sobre el DOM: las <li> se reinsertan en el contenedor.
   *
   * @param {'az'|'za'|'mas-nuevas'} criterio Cómo ordenar:
   *   - `mas-nuevas`: invierte el orden actual (las últimas añadidas quedan arriba).
   *   - `az`: orden alfabético ascendente.
   *   - `za`: orden alfabético descendente.
   */
  const ordenarTareas = (criterio) => {
    const tareasEnLista = Array.from(listaDeTareas.querySelectorAll("li"));

    if (criterio === "mas-nuevas") {
      tareasEnLista.reverse();
    } else {
      tareasEnLista.sort((a, b) => {
        const textoA = a.querySelector("strong").textContent.toLowerCase();
        const textoB = b.querySelector("strong").textContent.toLowerCase();

        if (textoA < textoB) return criterio === "az" ? -1 : 1;
        if (textoA > textoB) return criterio === "az" ? 1 : -1;
        return 0;
      });
    }

    tareasEnLista.forEach((tarea) => listaDeTareas.appendChild(tarea));
  };

  /**
   * Actualiza el panel de recuento con las cantidades actuales.
   * Muestra total, completadas y pendientes.
   */
  const actualizarRecuentoTareas = () => {
    const tareasEnLista = Array.from(listaDeTareas.querySelectorAll("li"));
    const totalTareas = tareasEnLista.length;
    const tareasCompletadas = tareasEnLista.filter((tareaElemento) =>
      obtenerEstadoCompletado(tareaElemento)
    ).length;
    const tareasPendientes = totalTareas - tareasCompletadas;

    let panelRecuento = document.getElementById("recuento-texto");
    if (!panelRecuento) {
      panelRecuento = document.createElement("div");
      panelRecuento.id = "recuento-texto";
      listaDeTareas.parentNode.insertBefore(panelRecuento, listaDeTareas.nextSibling);
    }

    panelRecuento.innerHTML = "";

    const crearLineaRecuento = (emoji, label, valor) => {
      const linea = document.createElement("p");
      linea.appendChild(document.createTextNode(`${emoji} ${label}: `));
      const dato = document.createElement("strong");
      dato.textContent = valor;
      linea.appendChild(dato);
      return linea;
    };

    panelRecuento.appendChild(crearLineaRecuento("✅", "Completadas", tareasCompletadas));
    panelRecuento.appendChild(crearLineaRecuento("📌", "Pendientes", tareasPendientes));
    panelRecuento.appendChild(crearLineaRecuento("📊", "Total", totalTareas));
  };

  /**
   * Configura los event listeners principales de la UI.
   * - Formulario de creación.
   * - Búsqueda en tiempo real.
   * - Clicks para borrar y marcar completadas.
   * - Doble click para editar tareas.
   * - Botones de filtrado.
   */
  const inicializarEventos = () => {
    if (!formCrearTarea || !listaDeTareas || !inputBuscarTarea) {
      mostrarError("No se pudieron inicializar eventos de la UI.");
      return;
    }

    formCrearTarea.addEventListener("submit", async (e) => {
      e.preventDefault();
      await capturarValorTarea();
    });

    // Filtra tareas en tiempo real al escribir en el buscador.
    inputBuscarTarea.addEventListener("input", () => {
      const textoABuscar = inputBuscarTarea.value.toLowerCase().trim();
      Array.from(listaDeTareas.children).forEach((li) => {
        const texto = li.querySelector("strong").textContent.toLowerCase();
        li.style.display = texto.includes(textoABuscar) ? "flex" : "none";
      });
    });

    listaDeTareas.addEventListener("click", async (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      const id = Number(li.dataset.id);
      if (!id) return;

      if (e.target.classList.contains("borrar")) {
        mostrarCargando(true, "Eliminando tarea...");
        try {
          await apiClientRef.eliminarTarea(id);
          li.style.opacity = "0";
          li.style.transform = "scale(0.9)";
          setTimeout(() => {
            li.remove();
            actualizarRecuentoTareas();
          }, 300);
          mostrarExito("Tarea eliminada.");
        } catch (error) {
          mostrarError(`No se pudo eliminar la tarea: ${error.message}`);
        } finally {
          mostrarCargando(false);
        }
      }

      if (e.target.classList.contains("btn-tick")) {
        const estadoActual = e.target.classList.contains("completada");
        const nuevoEstado = !estadoActual;

        mostrarCargando(true, "Actualizando tarea...");
        try {
          const tareaActualizada = await apiClientRef.actualizarTarea(id, {
            completada: nuevoEstado,
          });
          e.target.classList.toggle("completada", tareaActualizada.completada);
          li
            .querySelector("strong")
            .classList.toggle("completada-texto", tareaActualizada.completada);
          actualizarRecuentoTareas();
          mostrarExito("Tarea actualizada.");
        } catch (error) {
          mostrarError(`No se pudo actualizar la tarea: ${error.message}`);
        } finally {
          mostrarCargando(false);
        }
      }
    });

    listaDeTareas.addEventListener("dblclick", (e) => {
      if (e.target.tagName !== "STRONG") return;

      const textoTareaOriginal = e.target.textContent;
      const inputEdicionTarea = document.createElement("input");
      inputEdicionTarea.type = "text";
      inputEdicionTarea.value = textoTareaOriginal;
      inputEdicionTarea.className = "input-edicion";

      const elementoTarea = e.target.parentElement;
      elementoTarea.replaceChild(inputEdicionTarea, e.target);
      inputEdicionTarea.focus();

      const finalizar = async () => {
        const { valido, texto, mensaje } = validarTextoTarea(inputEdicionTarea.value);
        if (!valido) {
          mostrarError(mensaje);
          inputEdicionTarea.focus();
          return;
        }

        mostrarCargando(true, "Guardando cambios...");
        try {
          const id = Number(elementoTarea.dataset.id);
          const tareaActualizada = await apiClientRef.actualizarTarea(id, { titulo: texto });

          const strong = document.createElement("strong");
          strong.textContent = tareaActualizada.titulo;
          if (elementoTarea.querySelector(".completada")) {
            strong.classList.add("completada-texto");
          }

          elementoTarea.replaceChild(strong, inputEdicionTarea);
          actualizarRecuentoTareas();
          mostrarExito("Cambios guardados.");
        } catch (error) {
          mostrarError(`No se pudo editar la tarea: ${error.message}`);
          inputEdicionTarea.focus();
        } finally {
          mostrarCargando(false);
        }
      };

      inputEdicionTarea.addEventListener("blur", () => {
        finalizar();
      });
      inputEdicionTarea.addEventListener("keydown", async (ev) => {
        if (ev.key === "Enter") await finalizar();
      });
    });

    const btnCompletadas = document.querySelector(".baja");
    const btnPendientes = document.querySelector(".alta");
    const btnTodas = document.querySelector(".media");

    if (btnCompletadas) {
      btnCompletadas.addEventListener("click", () => filtrar("finalizado"));
    }
    if (btnPendientes) {
      btnPendientes.addEventListener("click", () => filtrar("pendiente"));
    }
    if (btnTodas) {
      btnTodas.addEventListener("click", () => filtrar("todos"));
    }

    if (btnToggleTema) {
      btnToggleTema.addEventListener("click", () => {
        const temaActual = document.body.classList.contains("dark") ? "dark" : "light";
        const nuevoTema = temaActual === "dark" ? "light" : "dark";
        aplicarTema(nuevoTema);
      });
    }

    if (selectOrden) {
      selectOrden.addEventListener("change", () => ordenarTareas(selectOrden.value));
      ordenarTareas(selectOrden.value);
    }
  };

  const inicializarApp = async () => {
    try {
      inicializarEstadoUi();
      aplicarTema("light");
      inicializarEventos();

      if (!apiClientRef) {
        mostrarError("No se encontro el cliente HTTP. Revisa la carga de scripts.");
        return;
      }

      await cargarTareasConEstado();
    } catch (error) {
      console.error("[TaskFlow UI Error]", error);
      mostrarError(`Error inicializando la app: ${error.message}`);
    }
  };

  inicializarApp();
});