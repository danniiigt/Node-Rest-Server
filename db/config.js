const mongoose = require('mongoose')
require('colors')

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODBCONNECTION);

        console.log(`\nConectada MongoDb v${mongoose.version}`.blue);

    } catch (error) {
        throw new Error('Error en la db: ' + error)
    }
}

module.exports = {
    dbConnection
}