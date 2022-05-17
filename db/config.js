const mongoose = require('mongoose')
require('colors')

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODBCONNECTION);

        console.log(`Conectada MongoDb v${mongoose.version}`.green);

    } catch (error) {
        throw new Error('Error en la db: ' + error)
    }
}

module.exports = {
    dbConnection
}