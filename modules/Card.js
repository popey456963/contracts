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

    compare(card, trump) {
        console.log('comparing', card, this, 'trump=', trump)

        // returns true if we're better, false if we're not.

        if (this.suit === trump) {
            console.log('this is a trump')

            // we are a trump!

            if (card.suit !== trump) {
                console.log('they are not a trump, we win!')
                // they are not a trump.
                return true
            } else {
                console.log('they are both trumps, are we better?')
                // they are both trumps
                return RANKS.indexOf(this.rank) > RANKS.indexOf(card.rank)
            }
        } else {
            console.log('this is not a trump')

            // we are not a trump
            if (card.suit === trump) {
                console.log('they are a trump')
                // they are a trump
                return false
            }

            if (card.suit !== this.suit) {
                console.log('they are the wrong suit')
                // they are a different suit
                return false
            }

            // they are same suit and neither are trumps
            console.log('neither are trumps,  which is beter?')
            return RANKS.indexOf(this.rank) > RANKS.indexOf(card.rank)
        }
    }
}

module.exports = Card