const mongoose = require('mongoose')
require('colors')

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODBCONNECTION);

        console.log('DB CONECTADA'.green);

    } catch (error) {
        throw new Error('Error en la db: ' + error)
    }
}

module.exports = {
    dbConnection
}