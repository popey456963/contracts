const RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King']
const SUITS = ['Clubs', 'Diamonds', 'Hearts', 'Spades']

function isCardPlayable(first, toPlay, hand) {
    if (toPlay.suit === first.suit) {
        // same suit always playable
        return true
    }

    if (hand.cards.findIndex(card => card.suit === first.suit) === -1) {
        // no cards of same suit
        return true
    }

    return false
}

function playToCenter(card, index) {
    displayHand({ cards: [card] }, () => {}, 220, index * 18)
}

function displayHand(hand, callback, x = 400, offset = 0, y = 0) {
    const numCards = hand.cards.length

    for (let [index, card] of Object.entries(hand.cards)) {
        card.index = index
        $('#card-table').append(makeCard({
            rank: card.rank,
            suit: card.suit
        }, {
            x: x,
            y: 322 + index * 18 - numCards * 9 + offset + y,
            z: 150
        }))

        $(`#${card.suit}-${card.rank}`).click(() => {
            callback(undefined, card)
        })
    }
}

function makeCard(card, position) {
    const card_x = (RANKS.indexOf(card.rank) + 1) * -69
    const card_y = (SUITS.indexOf(card.suit)) * -94
    const x = position.x
    const y = position.y
    const zIndex = position.z

    return `
        <div
            id='${card.suit}-${card.rank}'
            class='card'
            style='width: 69px; height: 94px; background-image: url("/img/cards.png"); position: absolute; cursor: pointer; transform: rotate(0deg); background-position: ${card_x}px ${card_y}px; z-index: ${zIndex}; top: ${x}px; left: ${y}px;'>
        </div>`
}