const { response } = require('express');

const Hospital = require('../models/hospital');

/**
 * Controlador para obtener una lista de hospitales paginada.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const getHospitales = async (req, res = response) => {
    try {
        const desde = Number(req.query.desde) || 0;

        // Verificar si la solicitud es para obtener todos los hospitales sin paginación
        if (desde === -1) {
            const [hospitales, total] = await Promise.all([
                // Obtener todos los hospitales y realizar la población del campo 'usuario'
                Hospital.find().populate('usuario', 'nombre img'),
                // Contar el total de hospitales en la base de datos
                Hospital.countDocuments()
            ]);

            // Enviar la respuesta con todos los hospitales y el total
            res.status(200).json({
                ok: true,
                hospitales,
                total
            });
        } else {
            // Obtener hospitales con paginación
            const [hospitales, total] = await Promise.all([
                Hospital.find()
                    .populate('usuario', 'nombre img')
                    .skip(desde)
                    .limit(5),
                Hospital.countDocuments()
            ]);

            // Enviar la respuesta con hospitales paginados y el total
            res.status(200).json({
                ok: true,
                hospitales,
                total
            });
        }
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
 * Controlador para crear un nuevo hospital.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const crearHospital = async (req, res = response) => {
    try {
        const uid = req.uid;
        // Crear un nuevo hospital con el ID del usuario autenticado y la información del cuerpo de la solicitud
        const hospital = new Hospital({
            usuario: uid,
            ...req.body
        });

        // Guardar el nuevo hospital en la base de datos
        const hospitalDB = await hospital.save();

        // Enviar la respuesta con el hospital creado
        res.json({
            ok: true,
            hospital: hospitalDB
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
    }
};

/**
 * Controlador para actualizar la información de un hospital existente.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const actualizarHospital = async (req, res = response) => {
    try {
        const id = req.params.id;
        const uid = req.uid;

        // Buscar el hospital por su ID
        const hospitalDB = await Hospital.findById(id);

        // Verificar si el hospital existe
        if (!hospitalDB) {
            return res.status(404).json({
                ok: false,
                msg: "Hospital no encontrado por ID."
            });
        }

        // Crear un objeto con los cambios solicitados y actualizar el hospital
        const cambiosHospital = {
            ...req.body,
            usuario: uid
        };

        // Actualizar el hospital en la base de datos y obtener la versión actualizada
        const hospitalActualizado = await Hospital.findByIdAndUpdate(id, cambiosHospital, { new: true });

        // Enviar la respuesta con el hospital actualizado
        res.json({
            ok: true,
            hospital: hospitalActualizado
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
    }
};

/**
 * Controlador para borrar un hospital existente por su ID.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const borrarHospital = async (req, res = response) => {
    try {
        const id = req.params.id;

        // Buscar el hospital por su ID
        const hospitalDB = await Hospital.findById(id);

        // Verificar si el hospital existe
        if (!hospitalDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Hospital no encontrado por ID.'
            });
        }

        // Borrar el hospital de la base de datos
        await Hospital.findByIdAndDelete(id);

        // Enviar la respuesta indicando que el hospital fue borrado
        res.json({
            ok: true,
            msg: 'Hospital borrado'
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
    }
};

// Exportar los controladores para su uso en otras partes de la aplicación
module.exports = {
    getHospitales,
    crearHospital,
    actualizarHospital,
    borrarHospital
};
