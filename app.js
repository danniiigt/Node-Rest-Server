const express = require('express')
const {dbConnection} = require('./db/config')
require('dotenv').config()
const app = express()
const port = process.env.PORT

console.clear()
console.log(' NODE REST SERVER @danniiigt '.bgBlue)
app.use(express.static('public'));
app.use(express.json())
dbConnection()
app.use('/api/usuarios', require('./routes/user.js'))
app.use('/api/auth', require('./routes/auth.js'))
app.use('/api/categorias', require('./routes/categorias.js'))
app.use('/api/productos', require('./routes/productos.js'))
app.use('/api/buscar', require('./routes/buscar.js'))

app.listen(port)
console.log(`\nEscuchando el puerto http://localhost:${port}/`.blue);