const express = require('express')

const Contracts = require('./modules/Contracts')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const DEBUG = require('./utils')

global.games = {}

app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/game/:game', function (req, res) {
    res.render('index', { DEBUG })
})

io.on('connection', socket => {
    let game = undefined

    console.log('a user connected')

    socket.on('disconnect', () => {
        console.log('user disconnected')

        if (socket.game_id in games) {
            games[socket.game_id].sockets = games[socket.game_id].sockets.filter(their_socket => their_socket.id !== socket.id)
            game.update_players()
        }

    })

    socket.on('bet', bet => {
        game.set_bet(socket, bet)
    })

    socket.on('game_id', id => {
        if (!(id in games)) {
            games[id] = {
                sockets: [],
                game: new Contracts(id)
            }
        }

        game = games[id].game

        game.add_player(socket)

        socket.game_id = id
        console.log('player connects to game', id)
    })

    socket.on('username', username => {
        socket.username = username
        game.update_players()
    })

    socket.on('playing_card', card => 
        game.play_card(socket, card)
    )

    socket.on('start_game', () => {
        console.log('a player wanted to start a game')
        game.start()
    })
})

http.listen(3000, () => console.log('listening on 3000'))