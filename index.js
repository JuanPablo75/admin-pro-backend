require('dotenv').config();

const express = require ('express');
var cors = require('cors');

const { dbConnection } = require('./database/config.js')

// console.log(process.env)

//Crear el servidor de Express
const app = express();

//Configurar CORS
app.use(cors());

// Carpeta publica
app.use(express.static('public'));

// Lectura y parseo del body
app.use(express.json());


//Base de datos
dbConnection();


//Rutas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/hospitales', require('./routes/hospitales'));
app.use('/api/medicos', require('./routes/medicos'));
app.use('/api/todo', require('./routes/busquedas'));
app.use('/api/login', require('./routes/auth'));
app.use('/api/upload', require('./routes/uploads'));

//
app.get('*' , (req, res) => {
    res.sendFile( path.resolve( __dirname , '../public/index.html'));  //cuando no se encuentra una ruta en particular lo devuelve a la pagina principal
});

app.listen( process.env.PORT, () => {
    console.log("Servidor corriendo en el puerto: " , process.env.PORT)
});


