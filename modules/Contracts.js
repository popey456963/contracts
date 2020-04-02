const { RANKS, SUITS } = require('../utils')

const _ = require('lodash')

const Deck = require('./Deck')
const Card = require('./Card')

function arrayRotate(arr) {
    arr.push(arr.shift());
    return arr;
}

class Contracts {
    constructor(id) {
        this.id = id
        this.hand = []
    }

    getSocket(socket_id) {
        return this.game.sockets.find(their_socket => their_socket.id === socket_id)
    }

    getSocketIndex(socket_id) {
        return this.game.sockets.findIndex(their_socket => their_socket.id === socket_id)
    }

    deal_hands() {
        const deck = new Deck()
        const players = this.game.sockets.length

        if (players === 1) {
            // only keep two cards for testing
            const temp_deck = new Deck()

            for (let card of temp_deck.cards) {
                if (card.suit !== 'Clubs' || (card.rank !== 'Jack' && card.rank !== 'Queen')) {
                    deck.remove(card)
                }
            }
        }

        if (players === 3) {
            deck.remove(new Card('2', 'Clubs'))
        }

        if (players === 5) {
            deck.remove(new Card('2', 'Clubs'))
            deck.remove(new Card('2', 'Spades'))
        }

        deck.shuffle()

        const hands = deck.deal(players)

        for (let hand of hands) {
            hand.order()
        }

        return hands
    }

    add_player(socket) {
        this.game.sockets.push(socket)
        this.event('player_added', socket.id)
        this.update_players()
    }

    update_players() {
        this.event('all_players', this.game.sockets.map(their_socket => ({
            id: their_socket.id,
            username: their_socket.username,
            bet: their_socket.bet,
            points: their_socket.points,
            isBetting: their_socket.isBetting,
            hands_won: their_socket.hands_won
        })))
    }

    event(cat, message) {
        this.game.sockets.forEach(socket => {
            socket.emit(cat, message)
        })
    }

    start() {
        this.game.sockets = _.shuffle(this.game.sockets)
        this.trumps = { suit: SUITS[0], index: 0 }

        this.event('round_info', { trump: SUITS[0], round: 1 })
        this.event('game_start')

        this.hands = this.deal_hands()

        for (let [index, hand] of Object.entries(this.hands)) {
            this.game.sockets[index].emit('hand', hand)
        }

        for (let socket of this.game.sockets) {
            socket.bet = 'None'
        }

        this.startBetting(this.game.sockets[0])
        this.update_players()
    }

    startBetting(socket) {
        this.event('betting', socket.id)
        socket.isBetting = true
        socket.emit('betting_start')
        this.event('player_betting', socket.id)
    }

    initialPlay() {
        // set first person to play a card...
        this.event('to_play', this.game.sockets[0].id)
    }

    play_card(socket, card) {
        // let players know a card was played
        this.event('played_card', { socket_id: socket.id, card })

        // set who played it
        card.socket = socket.id

        card = Object.assign(new Card(card.rank, card.suit), card)

        // add card to current hand
        this.hand.push(card)

        const socketIndex = this.getSocketIndex(socket.id)

        if (this.hand.length < this.game.sockets.length) {
            // continue on to next player in hand
            const newIndex = socketIndex + 1
            if (newIndex > this.game.sockets.length - 1) newIndex = 0
            this.event('to_play', this.game.sockets[newIndex].id)

            return
        }

        if (socketIndex === this.game.sockets.length - 1) {
            // all bets done!
            console.log('all cards played in hand')
            console.log(this.hand)

            let best = this.hand[0]
            for (let [index, card] of Object.entries(this.hand)) {
                this.hands[this.getSocketIndex(card.socket)].remove(card)

                if (index === 0) continue

                const trumps = Number(this.getSocket(card.socket).bet) === 0 ? undefined : this.trumps.suit
                if (card.compare(best, trumps)) best = card
            }

            this.hand = []

            const winning_socket = this.getSocket(best.socket)
            winning_socket.hands_won = ++winning_socket.hands_won || 1
            this.update_players()
            this.event('player_win', winning_socket.id)

            setTimeout(() => {
                console.log('rotating')

                while(this.game.sockets[0].id !== winning_socket.id) {
                    arrayRotate(this.game.sockets)
                    arrayRotate(this.hands)
                }

                this.update_players()

                this.event('new_hand')
                for (let [index, hand] of Object.entries(this.hands)) {
                    this.game.sockets[index].emit('hand', hand)
                }

                console.log('new hand')

                if (this.hands[0].cards.length === 0) {
                    console.log('finished')
                    // finished!
                    for (let socket of this.game.sockets) {
                        if (!socket.points) socket.points = 0
                        if (socket.hands_won == Number(socket.bet) && Number(socket.bet) !== 0) socket.points += 6 * Number(socket.bet)
                        else if (socket.hands_won == Number(socket.bet) && Number(socket.bet) === 0) socket.points += 10
                        else socket.points += socket.hands_won

                        socket.hands_won = 0
                    }

                    this.update_players()

                    this.trumps = { suit: SUITS[this.trumps.index + 1], index: this.trumps.index + 1 }
                    this.event('round_info', { trump: this.trumps.suit, round: this.trumps.index + 1 })

                    this.event('game_start')


                    this.hands = this.deal_hands()

                    for (let [index, hand] of Object.entries(this.hands)) {
                        this.game.sockets[index].emit('hand', hand)
                    }

                    for (let socket of this.game.sockets) {
                        socket.bet = 'None'
                    }

                    this.startBetting(this.game.sockets[0])
                    this.update_players()
                } else {
                    this.event('to_play', winning_socket.id)
                }
            }, 500)
        }
    }

    set_bet(socket, bet) {
        const socketIndex = this.getSocketIndex(socket.id)
        socket.bet = bet
        socket.isBetting = false

        if (socketIndex === this.game.sockets.length - 1) {
            // all bets done!
            console.log('all bets done')
            this.event('playing')
            this.initialPlay()
        } else {
            console.log('next betting')
            this.startBetting(this.game.sockets[socketIndex + 1])
        }

        this.update_players()
    }

    get game() {
        return games[this.id]
    }
}

module.exports = Contracts