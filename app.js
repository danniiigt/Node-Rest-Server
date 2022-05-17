const express = require('express')
const {dbConnection} = require('./db/config')
require('dotenv').config()
const app = express()
const port = process.env.PORT

console.clear()
app.use(express.static('public'));
app.use(express.json())
dbConnection()
app.use('/api/usuarios', require('./routes/user.js'))
app.use('/api/auth', require('./routes/auth.js'))
app.use('/api/categorias', require('./routes/categorias.js'))

app.listen(port)
console.log(`\nEscuchando el puerto http://localhost:${port}/`.blue);