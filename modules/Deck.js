const _ = require('lodash')

const Card = require('./Card')
const { RANKS, SUITS } = require('../utils')

class Deck {
    constructor(cards) {
        if (!cards) {
            cards = []
            for (let rank of RANKS) {
                for (let suit of SUITS) {
                    cards.push(new Card(rank, suit))
                }
            }
        }

        this.cards = cards
    }

    remove(card_to_remove) {
        const index = this.cards.findIndex(card => card.equals(card_to_remove))

        if (index == -1) {
            throw new Error('Tried removing card that did not exist')
        }

        this.cards.splice(index, 1)
    }

    shuffle() {
        this.cards = _.shuffle(this.cards)
    }

    // return x cards from deck
    take(n = 1) {
        return this.cards.splice(0, n)
    }

    deal(players) {
        let hands = []
        let length = this.cards.length

        for (let i = 0; i < players; i++) {
            hands.push(new Deck(this.take(Math.floor(length / players))))
        }

        return hands
    }

    order() {
        this.cards = this.cards.sort((a, b) => a.sort(b))
    }
}

module.exports = Deck