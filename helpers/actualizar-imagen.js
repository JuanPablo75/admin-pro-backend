const fs = require('fs');

const Usuario = require('../models/usuario')
const Medico = require('../models/medico')
const Hospital = require('../models/hospital')

/**
 * Borra una imagen del sistema de archivos.
 * @param {string} path - Ruta de la imagen a borrar.
 */
const borrarImagen = (path) => {
    // Verificar si el archivo existe y borrarlo
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

/**
 * Actualiza la imagen de un usuario, médico o hospital en la base de datos y borra la imagen anterior.
 * @param {string} tipo - Tipo de entidad ('medicos', 'hospitales', 'usuarios').
 * @param {string} id - Identificador único de la entidad.
 * @param {string} nombreArchivo - Nuevo nombre de archivo de la imagen.
 * @returns {boolean} - `true` si la actualización fue exitosa, `false` si no se encuentra la entidad con el ID proporcionado.
 */
const actualizarImagen = async (tipo, id, nombreArchivo) => {

    switch (tipo) {
        case 'medicos':
            {
                // Buscar y actualizar la imagen de un médico
                const medico = await Medico.findById(id);
                if (!medico) {
                    console.warn(`No hay un médico con id: ${id}`)
                    return false;
                }

                const pathViejo = `./uploads/medicos/${medico.img}`;

                // Borrar la imagen anterior
                borrarImagen(pathViejo);

                // Actualizar la imagen y guardar en la base de datos
                medico.img = nombreArchivo;
                await medico.save();
                return true;
            }

        case 'hospitales':
            {
                // Buscar y actualizar la imagen de un hospital
                const hospital = await Hospital.findById(id);
                if (!hospital) {
                    console.warn(`No hay un hospital con id: ${id}`)
                    return false;
                }

                const pathViejo = `./uploads/hospitales/${hospital.img}`;

                // Borrar la imagen anterior
                borrarImagen(pathViejo);

                // Actualizar la imagen y guardar en la base de datos
                hospital.img = nombreArchivo;
                await hospital.save();
                return true;
            }

        case 'usuarios':
            {
                // Buscar y actualizar la imagen de un usuario
                const usuario = await Usuario.findById(id);
                if (!usuario) {
                    console.warn(`No hay un usuario con id: ${id}`)
                    return false;
                }

                const pathViejo = `./uploads/usuarios/${usuario.img}`;

                // Borrar la imagen anterior
                borrarImagen(pathViejo);

                // Actualizar la imagen y guardar en la base de datos
                usuario.img = nombreArchivo;
                await usuario.save();
                return true;
            }

        default:
            break;
    }
}

module.exports = {
    actualizarImagen
};
