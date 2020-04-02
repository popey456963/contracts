function log(msg) {
    console.log(msg)
    // $('#actions').append($('<div></div>').text(msg))
}

function renderHand(hand, center, last, handCallback, highlight = false) {
    $('#card-table div').remove()

    hand.highlight = highlight
    hand.existingCards = center

    displayHand(hand, handCallback)
    displayHand({ cards: last || [] }, () => {}, 170, 0, 200)
    displayHand({ cards: center || [] }, () => { }, 220, (center || []).length * 9)
}

window.onbeforeunload = function (e) {
    return 'Are you sure you want to quit?';
};

function getHiddenProp() {
    var prefixes = ['webkit', 'moz', 'ms', 'o'];

    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';

    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++) {
        if ((prefixes[i] + 'Hidden') in document)
            return prefixes[i] + 'Hidden';
    }

    // otherwise it's not supported
    return null;
}

function isHidden() {
    var prop = getHiddenProp();
    if (!prop) return false;

    return document[prop];
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=")
    snd.play()
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

    function onCardClick(err, card) {
        console.log('clicked', card)

        if (!state.usToPlay) {
            return toastr["warning"]("It's not you to play!")
        }

        if (state.playedCards.length !== 0 && !isCardPlayable(state.playedCards[0], card, state.hand)) {
            return toastr["warning"]("You can't play this card.")
        }

        $(`#${card.suit}-${card.rank}`).remove()

        socket.emit('playing_card', card)
        state.usToPlay = false
    }

    socket.emit('game_id', window.location.pathname.split('/')[2])

    $('#username').val(localStorage.getItem('username'))
    socket.emit('username', localStorage.getItem('username'))

    $('#start_button').click(() => {
        socket.emit('start_game')
        // setState('Players are betting...')
    })

    $('#update_username').click(() => {
        const username = $('#username').val()
        if (username.length > 15) return toastr["error"]('Username too long')

        for (let player of state.players) {
            if (player.id === socket.id) continue

            if (similarity(username, player.username) > 0.75) {
                return toastr["error"](`Your name is too similar to ${player.username}`)
            }
        }

        socket.emit('username', username)
        localStorage.setItem('username', username)
        log(`Updated your username to ${username}`)
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

        renderHand(state.hand, state.playedCards, state.lastPlayedCards, onCardClick)

        setState(`${player.username || player.id} played ${card.rank} of ${card.suit}...`)
    })

    socket.on('hand', hand => {
        state.lastPlayedCards = state.playedCards
        state.hand = hand
        renderHand(hand, undefined, state.lastPlayedCards, onCardClick)
        state.playedCards = []

        console.log('hand', hand)
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
            if (isHidden()) beep()
            toastr.info(`It's your turn to play!`)
            state.usToPlay = true

        } else {
            setState(`${player.username || player.id} is playing...`)
        }
    })

    socket.on('player_betting', socket_id => {
        const player = state.players.find(player => player.id === socket_id)

        if (String(socket.id) == socket_id) {
            setState(`Waiting for you to bet...`)
            if (isHidden()) beep()
            toastr.info(`It's your turn to bet!`)
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