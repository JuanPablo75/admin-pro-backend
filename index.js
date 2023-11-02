require('dotenv').config();

const express = require ('express');
const cors = require('cors');

const { dbConnection } = require('./database/config.js')

// console.log(process.env)

//Crear el servidor de Express
const app = express();

//Configurar CORS
app.use(cors());

//Base de datos
dbConnection();


//Rutas
app.get('/', (req, res) => {

    res.json({
        ok: true,
        msg: "Hola Mundo!"
    });
})


app.listen( process.env.PORT, () =>{
    console.log("Servidor corriendo en el puerto: " , process.env.PORT)
})


