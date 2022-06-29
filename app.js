const express = require('express')
const morgan = require('morgan')
const config = require('./config/config')
const io = require('socket.io')
const http = require('http')
const bidEvents = require('./socket-controllers/bids')
const path = require('path')

const app = express()
const httpServer = http.Server(app)
const webSocketServer = io(httpServer)

// middlewares

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// routes

app.use(`/api/${config.SERVICE}`, require('./routes/bids'))

// sockets

bidEvents(webSocketServer)


app.get('/', (request, response) => {

    return response.sendFile(path.join(__dirname + '/index.html'))
})

httpServer.listen(config.PORT, () => console.log(`server started on port ${config.PORT} [${config.SERVICE}]`))