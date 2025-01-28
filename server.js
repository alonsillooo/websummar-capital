const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Ruta para manejar el envío de correos
app.post('/send-email', async (req, res) => {
    const { username, username2, ic, meCommand, oocMix } = req.body;

    // Configuración del transportador
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Usar Gmail como servicio de correo
        auth: {
            user: process.env.EMAIL,       // Correo desde el .env
            pass: process.env.EMAIL_PASSWORD // Contraseña desde el .env
        }
    });

    // Configuración del correo
    const mailOptions = {
        from: process.env.EMAIL,    // Correo remitente
        to: process.env.EMAIL,      // Correo receptor
        subject: 'Nuevo formulario recibido',
        text: `
        Nombre y apellidos: ${username}
        Correo electrónico: ${username2}
        Camiseta seleccionada: ${ic}
        Talla seleccionada: ${meCommand}
        País de envío: ${oocMix}
        Metodo de pago: ${pago}
    };

    try {
        // Enviar el correo
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Formulario enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: 'No se pudo enviar el correo' });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
