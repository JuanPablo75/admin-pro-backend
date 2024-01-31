const { response } = require('express');

const Hospital = require('../models/hospital');

const getHospitales = async (req, res = response) => {

    const hospitales = await Hospital.find()
                                    .populate('usuario', 'nombre img');

    res.status(200).json({
        ok: true,
        hospitales
    })
}

const crearHospital = async(req, res = response) => {

    const uid = req.uid;
    const hospital = new Hospital( {
        usuario:uid,
        ...req.body
    } );

    try {
        const hospitalDB = await hospital.save();

        res.json({
            ok: true,
            hospital : hospitalDB
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        })
    }

}
const actualizarHospital = async (req, res = response) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const hospitalDB = await Hospital.findById(id);

        if(!hospitalDB){
            return res.status(404).json ({
                ok: false,
                msg: "Hospital no encontrado por ID."
            })
        }

        const cambiosHospital = {
            ...req.body,
            usuario: uid
        }

        const hospitalActualizado = await Hospital.findByIdAndUpdate(id, cambiosHospital, {new: true});

        res.json({
            ok: true,
            hospital: hospitalActualizado
        })
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        })
    }

}
const borrarHospital = async (req, res = response) => {

    const id = req.params.id;

    try {

        const hospitalDB = await Hospital.findById(id);

        if(!hospitalDB){

            return res.status(404).json({
                ok: false,
                msg: 'Hospital no encontrado por ID'
            })
        }

        await Hospital.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'Hospital borrado'
        })
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        })
    }




}


module.exports = {
    getHospitales,
    crearHospital,
    actualizarHospital,
    borrarHospital
}