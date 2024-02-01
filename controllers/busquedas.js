const { response } = require('express');

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');


const getTodo = async (req, res = response) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp( busqueda, 'i' );


    const [ usuarios, medicos, hospitales] = await Promise.all([

        Usuario.find({ nombre: regex }).lean(),
        Medico.find({ nombre: regex }).lean(),
        Hospital.find({ nombre: regex }).lean()
    ]);

    res.status(200).json({
        ok: true,
        msg: 'getTodo',
        usuarios,
        medicos,
        hospitales
    })
}

const getDocumentosColeccion = async (req, res = response) => {

    const tabla     = req.params.tabla;
    const busqueda  = req.params.busqueda;
    const regex     = new RegExp( busqueda, 'i' ); 
    const desde = Number (req.query.desde) || 0;

    let data = [];

    switch (tabla) {
        case 'medicos':
            data = await Medico.find({ nombre: regex }) 
                               .lean()
                               .populate('usuario', 'nombre img')
                               .populate('hospital', 'nombre img');
            break;

        case 'hospitales':
            data = await Hospital.find({ nombre: regex })   
                                .lean()
                                .populate('usuario', 'nombre img');
            break;

        case 'usuarios':
            data = await Usuario.find({ nombre: regex })
                                .lean()
                                .skip(desde)
                                .limit(5);
            break;

        default:
            return res.status(400).json({
                ok: false,
                msg: 'La tabla tiene que ser usuarios/medicos/hospitales'
            });
        }

    res.json({
        ok: true,
        resultados: data
    })
}


module.exports = {
    getTodo,
    getDocumentosColeccion
}