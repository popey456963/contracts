function log(msg) {
    console.log(msg)
    // $('#actions').append($('<div></div>').text(msg))
}

function setState(state) {
    $('#state').text(state)
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

state = {}

$(function() {
    const socket = io()

    socket.emit('game_id', window.location.pathname.split('/')[2])

    $('#username').val(localStorage.getItem('username'))
    socket.emit('username', localStorage.getItem('username'))

    $('#start_button').click(() => {
        socket.emit('start_game')
        // setState('Players are betting...')
    })

    $('#update_username').click(() => {
        socket.emit('username', $('#username').val())
        localStorage.setItem('username', $('#username').val())
        log(`Updated your username to ${$('#username').val()}`)
    })

    $('#update_expected_hands').click(() => {
        socket.emit('bet', $('#expected_hands').val())
        $('#expected_hands_div').addClass('hidden')
    })

    socket.on('player_added', player_id => {
        log(`Added ${player_id} to the game.`)
    })

    socket.on('round_info', ({ trump, round }) => {
        $('#round').text(round)
        $('#trump').text(trump || 'None')
    })

    socket.on('all_players', players => {
        state.players = players

        const table = `
            <table style="width: 100%">
                <tr>
                    <th>Name</th>
                    <th>Bet</th>
                    <th>Hands Won</th>
                    <th>Points</th>
                </tr>
                ${players.map(player => {
                    const name = player.username || player.id
                    const bet = player.bet || 'none'
                    const hands_won = player.hands_won || 0
                    const points = player.points || 0

                    return `
                        <tr>
                            <td>${escapeHtml(name)}</td>
                            <td>${escapeHtml(String(bet))}</td>
                            <td>${escapeHtml(String(hands_won))}</td>
                            <td>${escapeHtml(String(points))}</td>
                        </tr>
                    `
                }).join('\n')}
            </table>`

        $('#player_entries').html(table)

        console.log(players)
        // log(`Updated current players`)
    })

    socket.on('played_card', ({ socket_id, card }) => {
        const player = state.players.find(player => player.id === socket_id)
        state.playedCards.push(card)

        playToCenter(card, state.playedCards.length)

        setState(`${player.username || player.id} played ${card.rank} of ${card.suit}...`)
    })

    socket.on('hand', hand => {
        $('#card-table div').remove()
        displayHand(hand, (err, card) => {
            console.log('clicked', card)

            if (!state.usToPlay) {
                return alert("It's not you to play!")
            }

            if (state.playedCards.length !== 0 && !isCardPlayable(state.playedCards[0], card, hand)) {
                return alert("You can't play this card.")
            }

            $(`#${card.suit}-${card.rank}`).remove()

            socket.emit('playing_card', card)
            state.usToPlay = false
        })

        displayHand({ cards: state.playedCards || [] }, () => { }, 170, 0, 200)

        state.playedCards = []

        console.log('hand', hand)
        // log(`Updated player hand`)
        // for (let card of hand.cards) {
        //     $('#hand').append(`<button>${card.rank} of ${card.suit}</button>`)
        // }
    })

    socket.on('betting_start', () => {
        $('#expected_hands_div').removeClass('hidden')
        log(`Betting has started for you!`)
    })

    socket.on('betting', () => {
        log(`Betting has started!`)
    })

    socket.on('playing', () => {
        console.log('playing!')
        log(`Playing has started!`)
        state.playedCards = []
        // setState('Playing!')
    })

    socket.on('game_start', () => {
        $('#start_button').addClass('hidden')
    })

    socket.on('to_play', socket_id => {
        console.log('to play called')
        const player = state.players.find(player => player.id === socket_id)

        if (String(socket.id) == socket_id) {
            setState(`Waiting for you to play...`)
            state.usToPlay = true
        } else {
            setState(`${player.username || player.id} is playing...`)
        }
    })

    socket.on('player_betting', socket_id => {
        const player = state.players.find(player => player.id === socket_id)

        if (String(socket.id) == socket_id) {
            setState(`Waiting for you to bet...`)
        } else {
            setState(`${player.username || player.id} is betting...`)
        }
    })

    // socket.on('new_hand', () => {
    //     for (let card of state.playedCards) {
    //         $(`#${card.suit}-${card.rank}`).remove()
    //     }
    // })

    socket.on('player_win', socket_id => {
        const player = state.players.find(player => player.id === socket_id)

        setState(`${player.username || player.id} won the hand.`)
        log(`Cards Played: ${state.playedCards.map(card => `${card.rank} of ${card.suit}`).join(', ')}`)
    })
})