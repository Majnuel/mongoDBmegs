import express, { Application } from "express"
import dayjs from "dayjs"
import fs from "fs"
const app: Application = express()
const handlebars = require('express-handlebars')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const msgModel = require('./models/messages.js')

if (!fs.existsSync('./chatLog.txt')) {
    fs.writeFileSync('./chatLog.txt', '')
    console.log('chatLog.txt creado')
}

let user: string = ''

io.on('connection', (socket: any) => {
    console.log('se conectó un usuario')
    socket.on('newProduct', (producto: object) => {
        console.log("nuevo producto via socket.io: ", producto)
        io.emit('newProduct', producto)
    })
    socket.on("email", (newChat: any) => {
        console.log('chat iniciado')
        console.log(newChat)
        user = newChat
    })
    socket.on("chat", (newChatMsg: any) => {
        console.log(newChatMsg)
        const timestamp = dayjs()
        io.emit("chat", {
            msg: newChatMsg,
            user: user,
            timestamp: timestamp
        })
        const obj = {
            user: user,
            timestamp: timestamp,
            msg: newChatMsg,
        }


        const newMessage = new msgModel(obj)
        newMessage.save()
            .then(() => {
                console.log('mensaje agregado')
            })
            .catch((err: any) => console.log(err))


        const stringified = JSON.stringify(obj)
        fs.appendFileSync('./chatLog.txt', '\n' + stringified)
    })
})

app.engine("hbs", handlebars({
    extname: '.hbs',
    defaultLayout: "index.hbs",
    layoutsDir: process.cwd() + "/views/layouts",
    partialsDir: process.cwd() + "/views/partials"
}))

// console.log(process.cwd() + "/desafio-10/src/views/layouts")

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.json())
app.use('/api', require('./rutas/routing'))
app.use('/productos', require('./rutas/routing'))

http.listen(7777, () => {
    console.log('server is live on port 7777')

    const mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost:27017/ecommerce',
        {
            useNewUrlParser: true, useUnifiedTopology: true
        }
    )
})

app.set('views', './views');
app.set('view engine', 'hbs');