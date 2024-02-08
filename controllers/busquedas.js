const { response } = require('express');

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

/**
 * Controlador para obtener todos los documentos que coinciden con la búsqueda en las colecciones de usuarios, médicos y hospitales.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const getTodo = async (req, res = response) => {
    try {
        // Obtener el parámetro de búsqueda desde la URL
        const busqueda = req.params.busqueda;
        // Crear una expresión regular para buscar sin distinguir mayúsculas y minúsculas
        const regex = new RegExp(busqueda, 'i');

        // Utilizar Promise.all para realizar búsquedas simultáneas en las tres colecciones
        const [usuarios, medicos, hospitales] = await Promise.all([
            // Buscar usuarios que coincidan con el nombre
            Usuario.find({ nombre: regex }).lean(),
            // Buscar médicos que coincidan con el nombre
            Medico.find({ nombre: regex }).lean(),
            // Buscar hospitales que coincidan con el nombre
            Hospital.find({ nombre: regex }).lean()
        ]);

        // Enviar la respuesta con los resultados
        res.status(200).json({
            ok: true,
            msg: 'getTodo',
            usuarios,
            medicos,
            hospitales
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor. Por favor, hable con el administrador.'
        });
    }
};

/**
 * Controlador para obtener documentos específicos de una colección que coinciden con la búsqueda.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const getDocumentosColeccion = async (req, res = response) => {
    try {
        // Obtener parámetros de la URL
        const tabla = req.params.tabla;
        const busqueda = req.params.busqueda;
        const regex = new RegExp(busqueda, 'i');
        // Obtener valor opcional desde la URL o establecer el valor predeterminado a 0
        const desde = Number(req.query.desde) || 0;

        let data = [];

        // Utilizar un switch para determinar la colección según la tabla especificada
        switch (tabla) {
            case 'medicos':
                // Buscar médicos que coincidan con el nombre y aplicar paginación
                data = await Medico.find({ nombre: regex })
                    .lean()
                    .skip(desde)
                    .limit(5);
                break;

            case 'hospitales':
                // Buscar hospitales que coincidan con el nombre y aplicar paginación
                data = await Hospital.find({ nombre: regex })
                    .lean()
                    .skip(desde)
                    .limit(5);
                break;

            case 'usuarios':
                // Buscar usuarios que coincidan con el nombre y aplicar paginación
                data = await Usuario.find({ nombre: regex })
                    .lean()
                    .skip(desde)
                    .limit(5);
                break;

            default:
                // Manejar caso donde la tabla no es usuarios/medicos/hospitales
                return res.status(400).json({
                    ok: false,
                    msg: 'La tabla tiene que ser usuarios/medicos/hospitales'
                });
        }

        // Enviar la respuesta con los resultados paginados
        res.json({
            ok: true,
            resultados: data
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor. Por favor, hable con el administrador.'
        });
    }
};

// Exportar los controladores para su uso en otras partes de la aplicación
module.exports = {
    getTodo,
    getDocumentosColeccion
};
