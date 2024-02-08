const path = require('path');
const fs = require('fs');

const { response } = require("express");
const { v4: uuidv4 } = require('uuid');

// Importar la función de ayuda para actualizar la imagen en la base de datos
const { actualizarImagen } = require('../helpers/actualizar-imagen');

/**
 * Controlador para subir archivos al servidor.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const fileUpload = (req, res = response) => {
    try {
        // Obtener el tipo (hospitales, medicos, usuarios) y el ID desde los parámetros de la solicitud
        const tipo = req.params.tipo;
        const id = req.params.id;

        // Validar tipo
        const tiposValidos = ['hospitales', 'medicos', 'usuarios'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({
                ok: false,
                msg: `El tipo: (${tipo}) no está permitido.`
            });
        }

        // Validar que exista un archivo
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No hay ningún archivo.'
            });
        }

        // Procesar la imagen
        const file = req.files.imagen;

        // Obtener la extensión del archivo
        const nombreCortado = file.name.split('.');
        const extension = nombreCortado[nombreCortado.length - 1];

        // Validar Extension
        const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
        if (!extensionesValidas.includes(extension.toLowerCase())) {
            return res.status(400).json({
                ok: false,
                msg: `La extensión del archivo no es válida (${extension})`
            });
        }

        // Generar el nombre único del archivo utilizando un identificador UUID
        const nombreArchivo = `${uuidv4()}.${extension}`;

        // Ruta para guardar la imagen en el sistema de archivos
        const rutaImagen = `./uploads/${tipo}/${nombreArchivo}`;

        // Mover la imagen al directorio correspondiente
        file.mv(rutaImagen, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al mover la imagen.',
                    err
                });
            }

            // Actualizar la base de datos con la nueva imagen
            actualizarImagen(tipo, id, nombreArchivo);

            res.json({
                ok: true,
                msg: 'Archivo subido',
                nombreArchivo
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor. Por favor, hable con el administrador.'
        });
    }
};

/**
 * Controlador para descargar archivos del servidor.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const fileDownload = (req, res = response) => {
    try {
        // Obtener el tipo (hospitales, medicos, usuarios) y el nombre de la foto desde los parámetros de la solicitud
        const tipo = req.params.tipo;
        const foto = req.params.foto;

        // Ruta completa de la imagen en el sistema de archivos
        const pathImg = path.join(__dirname, `../uploads/${tipo}/${foto}`);

        // Verificar si la imagen existe y enviarla al cliente
        if (fs.existsSync(pathImg)) {
            res.sendFile(pathImg);
        } else {
            // Enviar una imagen por defecto si la imagen no existe
            const pathImgDefault = path.join(__dirname, `../uploads/no-img.jpg`);
            res.sendFile(pathImgDefault);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor. Por favor, hable con el administrador.'
        });
    }
};

// Exportar los controladores para su uso en otras partes de la aplicación
module.exports = {
    fileUpload,
    fileDownload
};
