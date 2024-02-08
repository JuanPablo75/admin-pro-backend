const { response } = require('express');

const Medico = require('../models/medico');

/**
 * Controlador para obtener una lista paginada de médicos.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const getMedicos = async (req, res = response) => {
    try {
        const desde = Number(req.query.desde) || 0;

        // Obtener médicos con paginación, poblando los campos 'usuario' e 'hospital'
        const [medicos, total] = await Promise.all([
            Medico
                .find()
                .populate('usuario', '_id')
                .populate('hospital', 'nombre img')
                .skip(desde)
                .limit(5),
            Medico.countDocuments()
        ]);

        // Enviar la respuesta con médicos paginados y el total
        res.status(200).json({
            ok: true,
            medicos,
            total
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
 * Controlador para crear un nuevo médico.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const crearMedico = async (req, res = response) => {
    try {
        const uid = req.uid;
        // Crear un nuevo médico con el ID del usuario autenticado y la información del cuerpo de la solicitud
        const medico = new Medico({
            usuario: uid,
            ...req.body
        });

        // Guardar el nuevo médico en la base de datos
        const medicoDB = await medico.save();

        // Enviar la respuesta con el médico creado
        res.json({
            ok: true,
            medico: medicoDB
        });
    } catch (err) {
        // Manejar errores internos del servidor
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
    }
};

/**
 * Controlador para actualizar la información de un médico existente.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const actualizarMedico = async (req, res = response) => {
    try {
        const id = req.params.id;
        const uid = req.uid;

        // Buscar el médico por su ID
        const medicoDB = await Medico.findById(id);

        // Verificar si el médico existe
        if (!medicoDB) {
            return res.status(404).json({
                ok: true,
                msg: "Médico no encontrado por ID."
            });
        }

        // Crear un objeto con los cambios solicitados y actualizar el médico
        const cambiosMedico = {
            ...req.body,
            usuario: uid
        };

        // Actualizar el médico en la base de datos y obtener la versión actualizada
        const medicoActualizado = await Medico.findByIdAndUpdate(id, cambiosMedico, { new: true });

        // Enviar la respuesta con el médico actualizado
        res.json({
            ok: true,
            medico: medicoActualizado
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
    }
};

/**
 * Controlador para borrar un médico existente por su ID.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const borrarMedico = async (req, res = response) => {
    try {
        const id = req.params.id;

        // Buscar el médico por su ID
        const medicoDB = await Medico.findById(id);

        // Verificar si el médico existe
        if (!medicoDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Médico no encontrado por ID.'
            });
        }

        // Borrar el médico de la base de datos
        await Medico.findByIdAndDelete(id);

        // Enviar la respuesta indicando que el médico fue borrado
        res.json({
            ok: true,
            msg: 'Médico borrado'
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
    }
};

/**
 * Controlador para obtener un médico por su ID.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const getMedicoById = async (req, res = response) => {
    try {
        const id = req.params.id;

        // Buscar el médico por su ID y realizar la población de los campos 'usuario' y 'hospital'
        const medico = await Medico.findById(id)
            .populate('usuario', 'nombre img')
            .populate('hospital', 'nombre img');

        // Enviar la respuesta con el médico encontrado
        res.json({
            ok: true,
            medico
        });
    } catch (err) {
        // Manejar errores internos del servidor
        console.log(err);
        res.json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
    }
};

// Exportar los controladores para su uso en otras partes de la aplicación
module.exports = {
    getMedicos,
    crearMedico,
    actualizarMedico,
    borrarMedico,
    getMedicoById
};
