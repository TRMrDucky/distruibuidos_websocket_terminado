// declare stomp client
let stompCliente = null;
let usuarios = new Set();
let usuarioActual = null;
let usuarioSeleccionado = null;

const seleccionarUsuario = (nombre) => {

  if (usuarioSeleccionado === nombre) {
    usuarioSeleccionado = null;

    document.querySelectorAll("#listaUsuarios li").forEach(li => {
      li.classList.remove("active");
    });

    console.log("Usuario deseleccionado");
    return;
  }

  usuarioSeleccionado = nombre;

  document.querySelectorAll("#listaUsuarios li").forEach(li => {
    li.classList.remove("active");
  });

  document.querySelectorAll("#listaUsuarios li").forEach(li => {
    if (li.textContent === nombre) {
      li.classList.add("active");
    }
  });

  console.log("Usuario seleccionado:", nombre);
};
// function to suscribe to the broker
const onConnectSocket = () => {

  stompCliente.subscribe("/tema/mensajes", (mensaje) => {
    mostrarMensaje(mensaje.body);
  });

  stompCliente.subscribe("/tema/privado", (mensaje) => {
    mostrarMensajePrivado(mensaje.body);
  });
};

// what to do when websocket closes
const onWebSocketClose = () => {
  if (stompCliente !== null) {
    stompCliente.deactivate();
  }
};

// function to connect to websocket
const conectarWS = () => {
  // Avoid having many open connections
  onWebSocketClose();

  // Create client
  stompCliente = new StompJs.Client({
    webSocketFactory: () => new WebSocket("ws://localhost:8080/websocket"),
  });
  stompCliente.onConnect = onConnectSocket;
  stompCliente.onWebSocketClose = onWebSocketClose;
  stompCliente.activate();
};

// function to send message
const enviarMensaje = () => {
  let txtNombre = document.getElementById("txtNombre");
  let txtMensaje = document.getElementById("txtMensaje");

  if (!txtNombre.value || !txtMensaje.value) return;

  if (!usuarioActual) {
    usuarioActual = txtNombre.value;
  }

  if (usuarioSeleccionado) {

    stompCliente.publish({
      destination: "/app/privado",
      body: JSON.stringify({
        remitente: usuarioActual,
        destinatario: usuarioSeleccionado,
        contenido: txtMensaje.value,
      }),
    });
  } else {

    stompCliente.publish({
      destination: "/app/envio",
      body: JSON.stringify({
        nombre: usuarioActual,
        contenido: txtMensaje.value,
      }),
    });
  }

  txtMensaje.value = "";
};
const agregarUsuarioALista = (nombre) => {
  const lista = document.getElementById("listaUsuarios");

  const li = document.createElement("li");
  li.classList.add("list-group-item");
  li.textContent = nombre;

  li.addEventListener("click", () => {
    seleccionarUsuario(nombre);
  });

  lista.appendChild(li);
};

// function to show message
const mostrarMensaje = (mensaje) => {
  const body = JSON.parse(mensaje);

if (!usuarios.has(body.nombre) && body.nombre !== usuarioActual) {
  usuarios.add(body.nombre);
  agregarUsuarioALista(body.nombre);
}

  // get elements from html
  const ULMensajes = document.getElementById("ULMensajes");
  // Add message creating 'li' elements
  const mensajeLI = document.createElement("li");
  mensajeLI.classList.add("list-group-item");
  mensajeLI.innerHTML = `<strong>${body.nombre}</strong>: ${body.contenido}`;
  ULMensajes.appendChild(mensajeLI);
};

const mostrarMensajePrivado = (mensaje) => {
  const body = JSON.parse(mensaje);

  if (
    body.remitente === usuarioActual ||
    body.destinatario === usuarioActual
  ) {
    const ULMensajes = document.getElementById("ULMensajes");

    const mensajeLI = document.createElement("li");
    mensajeLI.classList.add("list-group-item", "list-group-item-warning");

    mensajeLI.innerHTML = `
      <strong>Privado</strong> 
      (${body.remitente} → ${body.destinatario}): 
      ${body.contenido}
    `;

    ULMensajes.appendChild(mensajeLI);
  }
};

// Event when all DOM Content is loaded
document.addEventListener("DOMContentLoaded", () => {
  const btnEnviar = document.getElementById("btnEnviar");
  btnEnviar.addEventListener("click", (e) => {
    e.preventDefault();
    enviarMensaje();
  });
  conectarWS();
});
