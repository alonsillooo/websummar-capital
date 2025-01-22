// URL del webhook de Discord
const webhookURL = "https://discordapp.com/api/webhooks/1331704944381788222/EQg22MlwJ6v37kPBvvViDessUfXv80wZoUwAeB7pNe7K56HDPYpaQh-u96GSaPLiESiK";

// Elementos del DOM
const form = document.getElementById('fichajeForm');
const historial = document.getElementById('historial');

// Cargar fichajes previos
const cargarFichajes = () => {
    const fichajes = JSON.parse(localStorage.getItem('fichajes')) || [];
    historial.innerHTML = '';
    fichajes.forEach((fichaje, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fichaje.nombre}</td>
            <td>${fichaje.fecha}</td>
            <td>${fichaje.horaEntrada || '-'}</td>
            <td>${fichaje.horaSalida || '-'}</td>
            <td>${fichaje.horasTrabajadas || '-'}</td>
            <td id="tiempo-${index}">${fichaje.horaSalida ? '-' : '0:00:00'}</td>
        `;
        historial.appendChild(row);

        // Iniciar contador si no hay hora de salida
        if (!fichaje.horaSalida) {
            iniciarContador(index, fichaje.horaEntrada);
        }
    });
};

// Iniciar contador en tiempo real
const iniciarContador = (index, horaEntrada) => {
    const contadorElement = document.getElementById(`tiempo-${index}`);
    const inicio = new Date(`${new Date().toLocaleDateString()} ${horaEntrada}`);

    const actualizarTiempo = () => {
        const ahora = new Date();
        const diferencia = ahora - inicio;

        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        contadorElement.textContent = `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    };

    // Actualizar cada segundo
    setInterval(actualizarTiempo, 1000);
    actualizarTiempo();
};

// Enviar log al webhook de Discord
const enviarLogADiscord = async (nombre, fecha, horaEntrada, horaSalida, horasTrabajadas) => {
    const mensaje = {
        content: `Registro de fichaje:\n- **Nombre**: ${nombre}\n- **Fecha**: ${fecha}\n- **Hora de Entrada**: ${horaEntrada}\n- **Hora de Salida**: ${horaSalida || '-'}\n- **Horas Trabajadas**: ${horasTrabajadas || '-'}`
    };

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mensaje),
        });

        if (!response.ok) {
            console.error("Error al enviar el log a Discord:", response.statusText);
        }
    } catch (error) {
        console.error("Error al conectar con Discord:", error);
    }
};

// Guardar fichaje
const guardarFichaje = (nombre) => {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString();
    const hora = ahora.toLocaleTimeString();

    let fichajes = JSON.parse(localStorage.getItem('fichajes')) || [];

    // Verificar si ya existe un fichaje abierto para este usuario
    let fichajeExistente = fichajes.find(fichaje => fichaje.nombre === nombre && !fichaje.horaSalida);

    if (fichajeExistente) {
        // Registrar hora de salida y calcular horas trabajadas
        fichajeExistente.horaSalida = hora;

        const horaEntrada = new Date(`${fecha} ${fichajeExistente.horaEntrada}`);
        const horaSalida = new Date(`${fecha} ${hora}`);
        const diferenciaHoras = ((horaSalida - horaEntrada) / (1000 * 60 * 60)).toFixed(2);

        fichajeExistente.horasTrabajadas = `${diferenciaHoras} horas`;

        // Enviar log a Discord
        enviarLogADiscord(
            nombre,
            fecha,
            fichajeExistente.horaEntrada,
            fichajeExistente.horaSalida,
            fichajeExistente.horasTrabajadas
        );
    } else {
        // Registrar nueva hora de entrada
        const nuevoFichaje = {
            nombre,
            fecha,
            horaEntrada: hora,
            horaSalida: null,
            horasTrabajadas: null,
        };
        fichajes.push(nuevoFichaje);

        // Enviar log a Discord
        enviarLogADiscord(nombre, fecha, hora, null, null);
    }

    localStorage.setItem('fichajes', JSON.stringify(fichajes));
    cargarFichajes();
};

// Manejar el envío del formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    if (nombre) {
        guardarFichaje(nombre);
        form.reset();
    } else {
        alert('Por favor, introduce tu nombre.');
    }
});

// Cargar los datos al inicio
cargarFichajes();
