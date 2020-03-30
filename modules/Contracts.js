const { send } = require('../utils')
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
        this.state = 'none'
        this.hand = []
    }

    add_player(socket) {
        this.game.sockets.push(socket)
        this.msg('player_added', socket.id)
        this.update_players()
    }

    update_players() {
        this.msg('all_players', this.game.sockets.map(their_socket => ({ id: their_socket.id, username: their_socket.username, bet: their_socket.bet, points: their_socket.points, isBetting: their_socket.isBetting, hands_won: their_socket.hands_won })))

    }

    msg(cat, message) {
        // console.log(this.game.sockets.length, cat, message)
        return send(this.game.sockets, cat, message)
    }

    start() {
        this.game.sockets = _.shuffle(this.game.sockets)

        const deck = new Deck()
        const players = this.game.sockets.length

        this.trumps = { suit: SUITS[0], index: 0 }

        this.msg('round_info', { trump: SUITS[0], round: 1 })

        this.msg('game_start')

        // console.log(deck)

        if (players === 1) {
            const temp_deck = new Deck()

            for (let card of temp_deck.cards) {
                if (card.suit !== 'Clubs' || (card.rank !== 'Jack' && card.rank !== 'Queen')) {
                    deck.remove(card)
                }
            }
        }

        if (players === 5) {
            deck.remove(new Card('2', 'Clubs'))
            deck.remove(new Card('2', 'Spades'))
        }

        if (players === 3) {
            deck.remove(new Card('2', 'Clubs'))
        }

        deck.shuffle()

        const hands = deck.deal(players)
        this.hands = hands

        for (let hand of this.hands) {
            hand.order()
        }

        for (let [index, hand] of Object.entries(this.hands)) {
            this.game.sockets[index].emit('hand', hand)
        }

        this.state = 'betting'

        this.startBetting(this.game.sockets[0])
        this.update_players()
    }

    startBetting(socket) {
        this.msg('betting', socket.id)
        socket.isBetting = true
        socket.emit('betting_start')
        this.msg('player_betting', socket.id)
    }

    initialPlay() {
        // set first person to play a card...
        this.msg('to_play', this.game.sockets[0].id)
    }

    play_card(socket, card) {
        this.msg('played_card', { socket_id: socket.id, card })
        card.socket = socket.id
        this.hand.push(card)

        const socketIndex = this.game.sockets.findIndex(their_socket => their_socket.id === socket.id)

        if (socketIndex === this.game.sockets.length - 1) {
            // all bets done!
            console.log('all cards played in hand')
            console.log(this.hand)

            let best = this.hand[0]
            for (let [index, card] of Object.entries(this.hand)) {
                const playerIndex = this.game.sockets.findIndex(their_socket => their_socket.id === card.socket)
                this.hands[playerIndex].remove(card)

                // first hand always best
                if (index === 0) continue

                // wrong suit, not trumps
                if (card.suit !== this.hand[0].suit && card.suit !== this.trumps.suit) {
                    continue
                }

                // current is trumps, 
                if (best.suit !== this.trumps.suit && card.suit === this.trumps.suit) {
                    best = card
                }

                if (RANKS.indexOf(card.rank) > RANKS.indexOf(best.rank)) {
                    best = card
                }
            }

            this.hand = []

            const winning_socket = this.game.sockets.find(their => their.id === best.socket)
            winning_socket.hands_won = ++winning_socket.hands_won || 1
            this.update_players()
            this.msg('player_win', winning_socket.id)

            setTimeout(() => {
                console.log('rotating')

                while(this.game.sockets[0].id !== winning_socket.id) {
                    arrayRotate(this.game.sockets)
                    arrayRotate(this.hands)
                }

                this.msg('new_hand')
                for (let [index, hand] of Object.entries(this.hands)) {
                    this.game.sockets[index].emit('hand', hand)
                }

                console.log('new hand')

                if (this.hands[0].cards.length === 0) {
                    console.log('finished')
                    // finished!
                    for (let socket of this.game.sockets) {
                        if (!socket.points) socket.points = 0
                        if (socket.hands_won == Number(socket.bet)) socket.points += 6 * Number(socket.bet)
                        else if (socket.hands_won == Number(socket.bet) && Number(socket.bet) === 0) socket.points += 10
                        else socket.points += socket.hands_won

                        socket.hands_won = 0
                    }

                    this.update_players()

                    this.trumps = { suit: SUITS[this.trumps.index + 1], index: this.trumps.index + 1 }
                    this.msg('round_info', { trump: this.trumps.suit, round: this.trumps.index + 1 })


                    const deck = new Deck()
                    const players = this.game.sockets.length

                    this.msg('game_start')

                    // console.log(deck)

                    if (players === 1) {
                        const temp_deck = new Deck()

                        for (let card of temp_deck.cards) {
                            if (card.suit !== 'Clubs' || (card.rank !== 'Jack' && card.rank !== 'Queen')) {
                                deck.remove(card)
                            }
                        }
                    }

                    if (players === 5) {
                        deck.remove(new Card('2', 'Clubs'))
                        deck.remove(new Card('2', 'Spades'))
                    }

                    if (players === 3) {
                        deck.remove(new Card('2', 'Clubs'))
                    }

                    deck.shuffle()

                    const hands = deck.deal(players)
                    this.hands = hands

                    for (let hand of this.hands) {
                        hand.order()
                    }

                    for (let [index, hand] of Object.entries(this.hands)) {
                        this.game.sockets[index].emit('hand', hand)
                    }

                    this.state = 'betting'

                    this.startBetting(this.game.sockets[0])
                    this.update_players()
                } else {
                    this.msg('to_play', winning_socket.id)
                }
            }, 500)

        } else {
            this.msg('to_play', this.game.sockets[socketIndex + 1].id)
        }
    }

    set_bet(socket, bet) {
        const socketIndex = this.game.sockets.findIndex(their_socket => their_socket.id === socket.id)
        socket.bet = bet
        socket.isBetting = false

        if (socketIndex === this.game.sockets.length - 1) {
            // all bets done!
            console.log('all bets done')
            this.msg('playing')
            this.state = 'playing'
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