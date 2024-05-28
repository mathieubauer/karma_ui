import { buildScoreBoard, updateScores } from './components/score.js'
import { buildCountdown, startCountdown, pauseCountdown } from './components/countdown.js'

const socket = io()

socket.on('chronoUpdate', ({ endTime, isRunning }) => {
    if (isRunning) {
        startCountdown(endTime)
    } else {
        pauseCountdown(endTime)
    }
})

socket.on('teamUpdate', ({ activeTeam }) => {
    document.querySelectorAll('.start').forEach(button => {
        button.classList.remove('btn-outline-primary')
        button.classList.remove('btn-primary')
    })
    if (activeTeam == 'A') {
        document.querySelector('#startA').classList.add('btn-primary')
        document.querySelector('#startB').classList.add('btn-outline-primary')
    }
    if (activeTeam == 'B') {
        document.querySelector('#startA').classList.add('btn-outline-primary')
        document.querySelector('#startB').classList.add('btn-primary')
    }
    if (activeTeam == null) {
        document.querySelector('#startA').classList.add('btn-primary')
        document.querySelector('#startB').classList.add('btn-primary')
    }
})

socket.on('questionUpdate', ({ question }) => {
    if (question) {
        document.querySelector('#question').innerHTML = question.question
        document.querySelector('#answer').innerHTML = question.answer
    } else {
        document.querySelector('#question').innerHTML = ''
        document.querySelector('#answer').innerHTML = ''
    }
})

socket.on('scoreUpdate', ({ scores }) => {
    updateScores(scores)
})

socket.on('displayError', ({ error }) => {
    document.querySelector('#question').innerHTML = error
})

socket.on('displayCategory', ({ category }) => {

    document.querySelectorAll('.category').forEach(button => {
        button.classList.remove('btn-secondary')
        button.classList.remove('btn-outline-secondary')

        if (button.id == category) {
            button.classList.add('btn-secondary')
        } else {
            button.classList.add('btn-outline-secondary')
        }

    })

})


// LISTENERS

document.querySelectorAll('.start').forEach(button => {
    button.addEventListener('click', (event) => {
        const startTeam = event.target.id
        socket.emit('start', { startTeam })
    })
})

document.querySelector('#draw').addEventListener('click', () => {
    socket.emit('draw')
})

document.getElementById('reset').addEventListener('click', () => {
    socket.emit('reset')
})

document.getElementById('resetScore').addEventListener('click', () => {
    socket.emit('resetScore')
})

document.querySelectorAll('.decision').forEach(button => {
    button.addEventListener('click', (event) => {
        const decision = event.target.id
        socket.emit('decision', { decision })
    })
})

document.querySelectorAll('.category').forEach(button => {
    button.addEventListener('click', (event) => {
        const newCategory = event.target.id
        // socket.emit('questionRequest', { questionCategory })
        socket.emit('category', { newCategory })
    })
})

// document.addEventListener('keydown', function (event) {
//     switch (event.key) {
//         case 'z':
//             document.getElementById('right').click()
//             break
//         case 'x':
//             document.getElementById('wrong').click()
//             break
//         case 's':
//             document.getElementById('steal').click()
//             break
//     }
// });

//

document.querySelector('#requestQuestion').addEventListener('click', () => {
    socket.emit('requestQuestion')
})

socket.on('receiveQuestion', ({ question }) => {
    document.querySelector('#questionRand').innerHTML = question.question
    document.querySelector('#answerRand').innerHTML = question.answer
})

// ONLOAD

buildCountdown()
buildScoreBoard()

//

let distance
let startTime
let delay
let state = "IDLE"
const audioBed = new Audio("../sound/affrontement.m4a")
const audioGenerique = new Audio("../sound/generique_karma.m4a")
const audioSuspense = new Audio("../sound/suspense.mp3")
const audioSting = new Audio("../sound/sting.mp3")
audioBed.volume = 0.4

window.addEventListener("keydown", handleKeyDown, true)


function handleKeyDown (event) {

    console.log(state)

    let letter = ''
    let audio

    if (event.type == 'click') {
        letter = event.target.id.toUpperCase()
        event.target.blur()
    } else if (event.type == 'keydown') {
        letter = event.key.toUpperCase()
    }

    console.log(letter)

    if (state == "IDLE") {
        // BUZZ
        if (
            letter == "Q" ||
            letter == "W" ||
            letter == "E" ||
            letter == "R" ||
            letter == "T" ||
            letter == "Y" ||
            letter == "U" ||
            letter == "I" ||
            letter == "O" ||
            letter == "P" ||
            letter == "A" ||
            letter == "S"
        ) {
            audioBed.pause()
            audioBed.currentTime = 0
            audioSuspense.pause()
            audioSuspense.currentTime = 0
            const audio = new Audio("../sound/hit_01.mp3").play()
            startTimer(3000)
        }
        if (letter == "B") {
            console.log('object')
            const audio = new Audio("../sound/correct.m4a").play()
            // startTimer(3000)
        }

        // if (letter == "S") {
        //     const audio = new Audio("../sound/hit_01.mp3").play()
        //     startTimer(3000)
        // }
        // if (letter == "D") {
        //     const audio = new Audio("../sound/hit_02.mp3").play()
        //     startTimer(3000)
        // }
    }



    // CORRECT
    if (letter == "Z") {
        const audio = new Audio("../sound/correct_alt.mp4").play()
        stopTimer()
    }
    // INCORRECT
    if (letter == "X") {
        const audio = new Audio("../sound/wrong.m4a").play()
        stopTimer()
    }
    // TIMEOUT
    if (letter == "L") {
        const audio = new Audio("../sound/time.m4a").play()
        stopTimer()
    }


    if (letter == "BACKSPACE") {
        console.log("hey")
        const audio = new Audio("../sound/buzz.m4a")
        audio.volume = 0.4
        audio.play()
    }

    if (letter == " ") {
        console.log("bed")
        if (audioBed.paused) {
            audioBed.play()
        } else {
            audioBed.pause()
            audioBed.currentTime = 0
        }
    }

    if (letter == "G") {
        if (audioGenerique.paused) {
            audioGenerique.play()
        } else {
            audioGenerique.pause()
            audioGenerique.currentTime = 0
        }
    }
    if (letter == "C") {
        if (audioSuspense.paused) {
            audioSuspense.play()
        } else {
            audioSuspense.pause()
            audioSuspense.currentTime = 0
        }
    }
    if (letter == "H") {
        if (audioSting.paused) {
            audioSting.play()
        } else {
            audioSting.pause()
            audioSting.currentTime = 0
        }
    }

    if (letter == "ENTER") {
        console.log("uh")
    }

}





// variable to store our intervalID
let nIntervId

function startTimer (newDelay) {
    startTime = new Date().getTime()
    state = "BUZZED"
    delay = newDelay
    // check if an interval has already been set up

    if (!nIntervId) {
        nIntervId = setInterval(displayTimer, 20)
    }
}

function displayTimer () {
    const now = new Date().getTime()
    distance = now - startTime
    // var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    // var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    var seconds = Math.floor((distance % (1000 * 60)) / 1000)
    var centiseconds = Math.floor((distance % (1000)) / 10)
    seconds = seconds < 10 ? "0" + seconds : seconds
    centiseconds = centiseconds < 10 ? "0" + centiseconds : centiseconds
}

function stopTimer () {
    state = "IDLE"
    clearInterval(nIntervId)
    // release our intervalID from the variable
    nIntervId = null
}
