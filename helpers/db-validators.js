const {Role} = require('../models')
const {Usuario} = require('../models')
const {Categoria} = require('../models/categoria')
const {Producto} = require('../models/producto')

const esRoleValido = async (rol = '') => {
    const existeRol = await Role.findOne({ rol })
    if (!existeRol) {
        throw new Error('Ese rol no está registrado en la BD')
    }
}

const emailExiste = async (correo = '') => {
    const existeEmail = await Usuario.findOne({ correo })
    if (existeEmail) {
      throw new Error('El correo introducido ya está en uso.')
    }
}

const existeUsuarioPorID = async (id = '') => {
    const existeUsuario = await Usuario.findById(id)
    if (!existeUsuario) {
      throw new Error('No se encuentra usuario con el ID proporcionado.')
    }
}

const existeCategoriaPorID = async (id = '') => {
    const existeCategoria = await Categoria.findById(id)
    if (!existeCategoria) {
      throw new Error('No se encuentra categoria con el ID proporcionado.')
    }
}

const existeEsaCategoria = async (nombre = '') => {
    const existeCategoria = await Categoria.findOne({nombre})
    if(existeCategoria) {
        throw new Error('Ya existe la categoria introducida.')
    }
}

const existeProductoPorID = async (id = '') => {
    const existeProducto = await Producto.findById(id)
    if (!existeProducto) {
      throw new Error('No se encuentra ningún producto con el ID proporcionado.')
    }
}

const existeEseProducto = async (nombre = '') => {
    const existeProducto = await Producto.findOne({nombre})
    if(existeProducto) {
        throw new Error('Ya existe el producto introducido.')
    }
}

const coleccionesPermitidas = (coleccion = '', coleccionesPermitidas = []) => {
    const incluida = coleccionesPermitidas.includes(coleccion)
    if(!incluida) {
        throw new Error(`La coleccion ${coleccion} no es permitida. (${coleccionesPermitidas})`)
    }

    return true
}

module.exports = {
    esRoleValido,
    emailExiste,
    existeUsuarioPorID,
    existeEsaCategoria,
    existeCategoriaPorID,
    existeProductoPorID,
    existeEseProducto,
    coleccionesPermitidas
}