const express = require('express')
const {dbConnection} = require('./db/config')
require('dotenv').config()
const app = express()
const port = process.env.PORT

app.use(express.static(__dirname + 'public'));
app.use(express.json())
dbConnection()
app.use('/api/usuarios', require('./routes/user.js'))
app.use('/api/auth', require('./routes/auth.js'))

app.listen(port)
console.log(`\nEscuchando el puerto http://localhost:${port}/`);