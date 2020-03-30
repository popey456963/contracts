const { RANKS, SUITS } = require('../utils')

class Card {
    constructor(rank, suit) {
        this.suit = suit
        this.rank = rank 
        this.shortName = suit[0].toLowerCase() + String(RANKS.indexOf(rank) + 1)
    }

    equals(card) {
        return this.suit === card.suit && this.rank === card.rank
    }

    sort(card) {
        if (SUITS.indexOf(this.suit) < SUITS.indexOf(card.suit) ||
            this.suit === card.suit && RANKS.indexOf(this.rank) < RANKS.indexOf(card.rank)) {
            return -1
        }

        return 1
    }
}

module.exports = Card