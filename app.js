const express = require('express')
const {dbConnection} = require('./db/config')
const fileUpload = require('express-fileupload')
require('dotenv').config()
const app = express()
const port = process.env.PORT

console.clear()
console.log(' NODE REST SERVER @danniiigt '.bgBlue)
app.use(cors())
app.use(express.static('public'));
app.use(express.json())
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    createParentPath: true
}));
dbConnection()
app.use('/api/usuarios', require('./routes/user.js'))
app.use('/api/auth', require('./routes/auth.js'))
app.use('/api/categorias', require('./routes/categorias.js'))
app.use('/api/productos', require('./routes/productos.js'))
app.use('/api/buscar', require('./routes/buscar.js'))
app.use('/api/uploads', require('./routes/uploads'))

app.listen(port)
console.log(`\nLocal App: ${`https://localhost:${port}`.blue}`.yellow);
console.log(`\Heroku App: ${(process.env.HEROKU_URL).blue}`.yellow);