window.addEventListener("load", () => {
  const MAX_LONGITUD_TAREA = 120;
  const STORAGE_KEY = "misTareas";
  const THEME_KEY = "taskflow-theme";

  const formCrearTarea = document.getElementById("form-crear");
  const listaDeTareas = document.getElementById("lista-tareas");
  const inputNuevaTarea = document.getElementById("crear");
  const inputBuscarTarea = document.getElementById("buscar");
  const selectOrden = document.getElementById("ordenar");
  const btnToggleTema = document.getElementById("toggle-tema");

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
   * Carga el tema guardado en localStorage y lo aplica.
   * Si no hay tema guardado, se aplica el tema claro por defecto.
   */
  const cargarTemaDesdeStorage = () => {
    const temaGuardado = localStorage.getItem(THEME_KEY);
    const temaInicial = temaGuardado === "dark" ? "dark" : "light";
    aplicarTema(temaInicial);
  };

  /**
   * Guarda la preferencia de tema en localStorage.
   *
   * @param {'light'|'dark'} tema Tema a guardar.
   */
  const guardarTema = (tema) => {
    localStorage.setItem(THEME_KEY, tema);
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
   * Serializa las tareas de la UI y las guarda en localStorage.
   * Usa STORAGE_KEY para mantener el nombre consistente.
   */
  const guardarEnStorage = () => {
    const tareasParaStorage = Array.from(listaDeTareas.querySelectorAll("li")).map(
      (tareaElemento) => ({
        textoTarea: tareaElemento.querySelector("strong").textContent,
        completada: tareaElemento
          .querySelector(".btn-tick")
          .classList.contains("completada"),
      })
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareasParaStorage));
  };

  /**
   * Carga las tareas guardadas en localStorage y las renderiza en la UI.
   * Ignora el contenido si no existe o no es JSON válido.
   */
  const cargarTareasDesdeStorage = () => {
    const datosGuardados = localStorage.getItem(STORAGE_KEY);
    if (!datosGuardados) return;

    try {
      const tareasGuardadas = JSON.parse(datosGuardados);
      tareasGuardadas.forEach((tarea) => {
        mostrarTareaEnHtml(tarea.textoTarea, tarea.completada, false);
      });
    } catch (error) {
      console.warn("No se pudo leer tareas de localStorage:", error);
    }
  };

  /**
   * Crea la estructura DOM de una tarea.
   *
   * @param {string} texto Texto de la tarea.
   * @param {boolean} completada Indica si ya está completada.
   * @returns {HTMLLIElement} Elemento <li> ya listo para insertarse en la lista.
   */
  const crearElementoTarea = (texto, completada) => {
    const li = document.createElement("li");

    const strong = document.createElement("strong");
    strong.className = completada ? "completada-texto" : "";
    strong.textContent = texto;

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const tick = document.createElement("i");
    tick.className = `fa-solid fa-check btn-tick ${completada ? "completada" : ""}`;

    const trash = document.createElement("i");
    trash.className = "fa-solid fa-trash-can borrar";

    acciones.appendChild(tick);
    acciones.appendChild(trash);

    li.appendChild(strong);
    li.appendChild(acciones);
    return li;
  };

  /**
   * Guarda en localStorage y actualiza el contador de tareas.
   *
   * Esta función se llama cuando cambian las tareas (añadir/borrar/completar).
   */
  const guardarYActualizar = () => {
    guardarEnStorage();
    actualizarRecuentoTareas();
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
   * @param {string} texto Texto de la tarea.
   * @param {boolean} [completada=false] Indica si la tarea debe mostrarse como completada.
   * @param {boolean} [guardar=true] Si se debe persistir en localStorage.
   */
  const mostrarTareaEnHtml = (texto, completada = false, guardar = true) => {
    const tareaElemento = crearElementoTarea(texto, completada);

    // Si el criterio es "Más nuevas", añadimos las tareas al inicio.
    if (selectOrden?.value === "mas-nuevas") {
      listaDeTareas.prepend(tareaElemento);
    } else {
      listaDeTareas.appendChild(tareaElemento);
    }

    if (guardar) guardarYActualizar();

    // Ordena cuando la opción seleccionada no depende del orden de inserción.
    if (selectOrden && selectOrden.value !== "mas-nuevas") {
      ordenarTareas(selectOrden.value);
    }
  };

  /**
   * Captura el valor del input de nueva tarea y lo agrega si es válido.
   *
   * - Valida que el texto no esté vacío ni exceda la longitud máxima.
   * - Evita duplicados.
   * - Muestra mensajes de alerta si hay errores.
   */
  const capturarValorTarea = () => {
    const { valido, texto, mensaje } = validarTextoTarea(inputNuevaTarea.value);
    if (!valido) {
      alert(mensaje);
      return;
    }

    if (esTareaDuplicada(texto)) {
      alert("Esa tarea ya existe.");
      return;
    }

    mostrarTareaEnHtml(texto);
    inputNuevaTarea.value = "";
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
    formCrearTarea.addEventListener("submit", (e) => {
      e.preventDefault();
      capturarValorTarea();
    });

    // Filtra tareas en tiempo real al escribir en el buscador.
    inputBuscarTarea.addEventListener("input", () => {
      const textoABuscar = inputBuscarTarea.value.toLowerCase().trim();
      Array.from(listaDeTareas.children).forEach((li) => {
        const texto = li.querySelector("strong").textContent.toLowerCase();
        li.style.display = texto.includes(textoABuscar) ? "flex" : "none";
      });
    });

    listaDeTareas.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      if (e.target.classList.contains("borrar")) {
        li.style.opacity = "0";
        li.style.transform = "scale(0.9)";
        setTimeout(() => {
          li.remove();
          guardarYActualizar();
        }, 300);
      }

      if (e.target.classList.contains("btn-tick")) {
        e.target.classList.toggle("completada");
        li.querySelector("strong").classList.toggle("completada-texto");
        guardarYActualizar();
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

      const finalizar = () => {
        const { valido, texto, mensaje } = validarTextoTarea(inputEdicionTarea.value);
        if (!valido) {
          alert(mensaje);
          inputEdicionTarea.focus();
          return;
        }

        const strong = document.createElement("strong");
        strong.textContent = texto;
        if (elementoTarea.querySelector(".completada"))
          strong.classList.add("completada-texto");

        elementoTarea.replaceChild(strong, inputEdicionTarea);
        guardarYActualizar();
      };

      inputEdicionTarea.addEventListener("blur", finalizar);
      inputEdicionTarea.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") finalizar();
      });
    });

    document.querySelector(".baja").addEventListener("click", () => filtrar("finalizado"));
    document.querySelector(".alta").addEventListener("click", () => filtrar("pendiente"));
    document.querySelector(".media").addEventListener("click", () => filtrar("todos"));

    if (selectOrden) {
      selectOrden.addEventListener("change", () => ordenarTareas(selectOrden.value));
      ordenarTareas(selectOrden.value);
    }
  };

  cargarTareasDesdeStorage();
  actualizarRecuentoTareas();
  inicializarEventos();
});