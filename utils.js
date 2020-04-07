module.exports.RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']
module.exports.SUITS = ['Clubs', 'Diamonds', 'Hearts', 'Spades']

module.exports.wrapAdd = (a, b, max) => {
    const sum = a + b
    return sum % max
}

module.exports.DEBUG = true