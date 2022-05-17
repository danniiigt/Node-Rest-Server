const nombreInput = document.getElementById('nombre')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const botonAñadirDatos = document.getElementById('añadirDatos')
const botonLimpiarDatos = document.getElementById('limpiarDatos')
const botonGuardarDB = document.getElementById('guardarDb')
const logOutBtn = document.getElementById('logout')

async function handleCredentialResponse(response) {
    const body = { id_token: response.credential }
    const res = await fetch('http://localhost:8080/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    const data = await res.json()
    await console.log(data);
    await localStorage.setItem('email', data.usuario.correo)
}

botonAñadirDatos.addEventListener('click', (e) => {
    e.preventDefault()
    getRandomUser('https://api.namefake.com/')
})

botonLimpiarDatos.addEventListener('click', (e) => {
    e.preventDefault()
    limpiarInputs()
})

botonGuardarDB.addEventListener('click', async (e) => {
    e.preventDefault()
    var usuario = `{
        "nombre": "${nombreInput.value}",
        "correo": "${emailInput.value}",
        "password": "${passwordInput.value}",
        "rol": "ADMIN_ROLE"
    }`;

    const res = await fetch('http://localhost:8080/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: usuario
    })

    const data = await res.json()
    console.log(data);
})

logOutBtn.addEventListener('click', (e) => {
    console.log(google.accounts.id);
    google.accounts.id.disableAutoSelect()

    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear()
        location.reload()
    });

})

const limpiarInputs = () => {
    nombreInput.value = ''
    emailInput.value = ''
    passwordInput.value = ''
    usuario = {}
}

const getRandomUser = async (url) => {
    const res = await fetch(url)
    const data = await res.json();
    replaceInputsData(data)
}

const replaceInputsData = async (data) => {
    nombreInput.value = data.username
    emailInput.value = data.email_u + '@gmail.com'
    passwordInput.value = data.username + '123'
}