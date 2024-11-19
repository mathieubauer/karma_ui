import socket from "./components/socket"

let myQuestion
const myQuestionsSet = new Set()

document.querySelector("#requestQuestion").addEventListener("click", () => {
    socket.emit("requestQuestion")
})

socket.on("receiveQuestion", ({ question }) => {
    myQuestion = question
    document.querySelector("#question").innerHTML = question.question
    document.querySelector("#answer").innerHTML = question.answer
})

/////

document.querySelectorAll(".category").forEach((button) => {
    button.addEventListener("click", (event) => {
        const decision = event.target.id
        if (decision == "aca") {
            if (myQuestion && !myQuestionsSet.has(myQuestion.question)) {
                myQuestionsSet.add(myQuestion.question)
                console.log(Array.from(myQuestionsSet))
            }

            if (myQuestion) {
                my.push(myQuestion)
            }

            console.log(my)
        }
    })
})

const text = document.querySelector("#text")
const timer = document.querySelector("#timer")

let distance
let startTime
let delay
let state = "IDLE"
const audioBed = new Audio("../sound/affrontement.m4a")
const audioGenerique = new Audio("../sound/generique_karma.m4a")
const audioSuspense = new Audio("../sound/suspense.mp3")
audioBed.volume = 0.4

window.addEventListener("keydown", handleKeyDown, true)

function handleKeyDown(event) {
    console.log(state)

    let letter = ""
    let audio

    if (event.type == "click") {
        letter = event.target.id.toUpperCase()
        event.target.blur()
    } else if (event.type == "keydown") {
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
            text.innerHTML = "Joueur 1"
            startTimer(3000)
        }
        if (letter == "B") {
            console.log("object")
            const audio = new Audio("../sound/correct.m4a").play()
            // text.innerHTML = "Joueur 2"
            // startTimer(3000)
        }

        // if (letter == "S") {
        //     const audio = new Audio("../sound/hit_01.mp3").play()
        //     text.innerHTML = "Joueur rouge"
        //     startTimer(3000)
        // }
        // if (letter == "D") {
        //     const audio = new Audio("../sound/hit_02.mp3").play()
        //     text.innerHTML = "Joueur bleu"
        //     startTimer(3000)
        // }
    }

    // CORRECT
    if (letter == "Z") {
        const audio = new Audio("../sound/correct_alt.mp4").play()
        text.innerHTML = "Correct"
        stopTimer()
        setTimeout(() => {
            text.innerHTML = ""
            timer.innerHTML = ""
        }, "2000")
    }
    // INCORRECT
    if (letter == "X") {
        const audio = new Audio("../sound/wrong.m4a").play()
        text.innerHTML = "Incorrect"
        stopTimer()
        setTimeout(() => {
            text.innerHTML = ""
            timer.innerHTML = ""
        }, "2000")
    }
    // TIMEOUT
    if (letter == "L") {
        const audio = new Audio("../sound/time.m4a").play()
        text.innerHTML = "Trop tard..."
        stopTimer()
        setTimeout(() => {
            text.innerHTML = ""
            timer.innerHTML = ""
        }, "2000")
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

    if (letter == "ENTER") {
        console.log("uh")
    }
}

// variable to store our intervalID
let nIntervId

function startTimer(newDelay) {
    startTime = new Date().getTime()
    state = "BUZZED"
    delay = newDelay
    // check if an interval has already been set up

    if (!nIntervId) {
        nIntervId = setInterval(displayTimer, 20)
    }
}

function displayTimer() {
    const now = new Date().getTime()
    distance = now - startTime
    // var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    // var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    var seconds = Math.floor((distance % (1000 * 60)) / 1000)
    var centiseconds = Math.floor((distance % 1000) / 10)
    seconds = seconds < 10 ? "0" + seconds : seconds
    centiseconds = centiseconds < 10 ? "0" + centiseconds : centiseconds
    timer.innerHTML = seconds + ":" + centiseconds
    if (distance > delay) {
        timer.innerHTML = "Temps écoulé"
    }
}

function stopTimer() {
    state = "IDLE"
    clearInterval(nIntervId)
    // release our intervalID from the variable
    nIntervId = null
}
