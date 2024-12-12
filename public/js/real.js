import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown } from "./components/countdown.js"
import { showToast } from "./components/toast.js"

// Déclaration des sons
const audioBuzz = new Audio("../sound/hit_01.mp3")
const audioBed = new Audio("../sound/affrontement_45v2.mp3") // affrontement_v2 : suspense pour choix
const audioGenerique = new Audio("../sound/generique_karma.m4a")
const audioSuspense = new Audio("../sound/suspense.mp3")
const audioFinale = new Audio("../sound/finale_full.mp3") // ex finale_long.mp3
const audioSting = new Audio("../sound/sting.mp3")
const audioStingFinale = new Audio("../sound/pre_finale.m4a")
const audioFinaleWin = new Audio("../sound/finale_win.mp3")
const audioFinaleLose = new Audio("../sound/finale_lose.mp3")
const audioRight = new Audio("../sound/correct_alt.mp4")
const audioWrong = new Audio("../sound/wrong.m4a")
audioBed.volume = 0.4
audioFinale.volume = 0.4

// Variables
let isAffrontementPlaying = false
let state = "IDLE"

// Affichage de l'écran real #####

socket.emit("getElementStates") // onload

socket.on("updateElementStates", (elementStates) => {
    if (elementStates.round || elementStates.round == 0) {
        if (elementStates.round == 0) displayRoundButtons("display_empty")
        if (elementStates.round == 1) displayRoundButtons("display_round1")
        if (elementStates.round == 2) displayRoundButtons("display_round2")
    }

    if (elementStates.currentCategory) {
        displayCategoryButtons(elementStates.currentCategory)
    }

    if (elementStates.isRunning !== undefined && elementStates.remainingTime !== undefined && elementStates.endTime !== undefined) {
        document.querySelector("#countdownContainer").innerHTML = ""
        buildCountdown()
        if (elementStates.isRunning) {
            startCountdown(elementStates.endTime)
        } else {
            pauseCountdown(elementStates.remainingTime)
        }
    }

    if (elementStates.scoreA !== undefined && elementStates.scoreB !== undefined) {
        document.querySelector("#scoreContainer").innerHTML = ""
        buildScoreBoard()
        updateScores(elementStates.scoreA, elementStates.scoreB)
    }

    document.querySelector("#question").innerHTML = elementStates.currentQuestion ? elementStates.currentQuestion.question : ""
    document.querySelector("#answer").innerHTML = elementStates.currentQuestion ? elementStates.currentQuestion.answer : ""

    if (!elementStates.currentQuestion) {
        // add attribute disabled

        document.querySelector("#right").disabled = true
        document.querySelector("#wrong").disabled = true
        document.querySelector("#steal").disabled = true
    } else {
        document.querySelector("#right").disabled = false
        document.querySelector("#wrong").disabled = false
        document.querySelector("#steal").disabled = false
    }
})

// Affichage de l'écran joueur #####

document.getElementById("display_empty").addEventListener("click", () => {
    socket.emit("display_empty")
})

document.getElementById("display_round1").addEventListener("click", () => {
    socket.emit("display_round1")
})

document.getElementById("display_round2").addEventListener("click", () => {
    socket.emit("display_round2")
})

// ##### ON REPREND TOUT

function toggleElement(elementId, checkbox) {
    const isVisible = checkbox.checked
    socket.emit("changeElementVisibility", { elementId, isVisible })
}

// socket.on("updateElementStates", (elementStates) => {
//     document.getElementById("togglePseudo").checked = elementStates.pseudo
//     document.getElementById("toggleQuestionContainer").checked = elementStates.questionContainer
//     document.getElementById("toggleAnswerInput").checked = elementStates.answerInput
//     document.getElementById("toggleCountdown").checked = elementStates.countdown
//     document.getElementById("toggleScore").checked = elementStates.score
// })

// document.getElementById("togglePseudo").addEventListener("change", (e) => toggleElement("pseudo", e.target))
// document.getElementById("toggleQuestionContainer").addEventListener("change", (e) => toggleElement("questionContainer", e.target))
// document.getElementById("toggleAnswerInput").addEventListener("change", (e) => toggleElement("answerInput", e.target))
// document.getElementById("toggleCountdown").addEventListener("change", (e) => toggleElement("countdown", e.target))
// document.getElementById("toggleScore").addEventListener("change", (e) => toggleElement("score", e.target))

// Gestion des utilisateurs #####

socket.emit("getConnectedHosts")

socket.on("connectedPlayers", (players) => {
    playersList.innerHTML = ""
    players.forEach((player) => {
        const span = document.createElement("span")
        span.innerHTML = `${player.pseudo}`
        span.id = player.pseudo
        span.classList.add("badge", "text-bg-light", "rounded-pill", "me-1")
        playersList.appendChild(span)
    })
})

// Gestion des questions ouvertes #####

socket.on("playerAnswer", ({ pseudo, answer }) => {
    const span = document.createElement("span")
    span.innerHTML = `${pseudo}: ${answer.answer} <br>`
    document.getElementById("answersList").appendChild(span)
})

// Request / receive random question #####

document.querySelector("#requestQuestion").addEventListener("click", () => {
    socket.emit("requestQuestion")
})

socket.on("receiveQuestion", ({ question }) => {
    document.querySelector("#questionRand").innerHTML = question.question
    document.querySelector("#answerRand").innerHTML = question.answer
})

document.querySelector("#sendQuestion").addEventListener("click", () => {
    const question = {
        question: document.querySelector("#questionRand").innerHTML,
        answer: document.querySelector("#answerRand").innerHTML,
    }
    socket.emit("sendQuestion", question)
})

// Choix de catégorie #####

document.querySelectorAll(".category").forEach((button) => {
    button.addEventListener("click", (event) => {
        const newCategory = event.target.id
        socket.emit("category", { newCategory })
    })
})

// Start

document.querySelectorAll(".start").forEach((button) => {
    button.addEventListener("click", (event) => {
        const startTeam = event.target.id
        socket.emit("start", { startTeam })
        audioBed.play()
        isAffrontementPlaying = true
    })
})

socket.on("displayError", ({ error }) => {
    document.querySelector("#question").innerHTML = error
})

socket.on("teamUpdate", ({ activeTeam }) => {
    // onload
    document.querySelectorAll(".start").forEach((button) => {
        button.classList.remove("btn-outline-primary")
        button.classList.remove("btn-primary")
    })
    if (activeTeam == "A") {
        document.querySelector("#startA").classList.add("btn-primary")
        document.querySelector("#startB").classList.add("btn-outline-primary")
    }
    if (activeTeam == "B") {
        document.querySelector("#startA").classList.add("btn-outline-primary")
        document.querySelector("#startB").classList.add("btn-primary")
    }
    if (activeTeam == null) {
        document.querySelector("#startA").classList.add("btn-primary")
        document.querySelector("#startB").classList.add("btn-primary")
    }
})

// Draw

document.querySelector("#draw").addEventListener("click", () => {
    socket.emit("draw")
})

// resetTime

document.getElementById("resetTime").addEventListener("click", () => {
    socket.emit("resetTime")
})

// Decision (right, wrong, steal)

document.querySelectorAll(".decision").forEach((button) => {
    button.addEventListener("click", (event) => {
        const decision = event.target.id
        socket.emit("decision", { decision })
        if (decision == "wrong") audioWrong.play()
        if (decision == "right" || decision == "steal") audioRight.play()
    })
})

// TODO: vérifier si on ne peut pas regrouper ?

document.querySelector("#wrong").addEventListener("click", () => {
    if (isAffrontementPlaying) {
        audioBed.pause()
        isAffrontementPlaying = false
        document.querySelector("#right").classList.remove("btn-success")
    } else {
        audioBed.play()
        isAffrontementPlaying = true
        document.querySelector("#right").classList.add("btn-success")
    }
})

document.querySelector("#steal").addEventListener("click", () => {
    if (isAffrontementPlaying) {
        //
    } else {
        audioBed.play()
        isAffrontementPlaying = true
        document.querySelector("#right").classList.add("btn-success")
    }
})

// Reset score

document.getElementById("resetScore").addEventListener("click", () => {
    socket.emit("resetScore")
})

// Gestion des questionnaires

document.getElementById("questionFileForm").addEventListener("submit", (e) => {
    e.preventDefault() // Empêche le rechargement de la page

    const select = document.getElementById("questionFileSelect")
    const selectedFile = select.value

    if (selectedFile) {
        // Émet l'événement avec le nom du fichier sélectionné
        socket.emit("changeQuestionFile", { fileName: selectedFile })
        showToast(`Fichier de questions "${selectedFile}" chargé avec succès !`, "success")
    } else {
        showToast("Veuillez sélectionner un fichier de questions.", "danger")
    }
})

// buzzers, manche 1

document.getElementById("activateBuzzerBtn").addEventListener("click", () => {
    socket.emit("activateBuzzer")
})

socket.on("buzzed", (pseudo) => {
    document.getElementById("buzzResultsContainer").innerHTML = pseudo
})

// ########## Gestion du son ##########

document.getElementById("playGenerique").addEventListener("click", () => playOrPause(audioGenerique))
document.getElementById("playSting").addEventListener("click", () => playOrPause(audioSting))
document.getElementById("playStingFinale").addEventListener("click", () => playOrPause(audioStingFinale))

document.getElementById("playGameBed").addEventListener("click", () => playOrPause(audioBed))
document.getElementById("playSuspense").addEventListener("click", () => playOrPause(audioSuspense))
document.getElementById("playFinale").addEventListener("click", () => playOrPause(audioFinale))

document.getElementById("playFinaleWin").addEventListener("click", () => playOrPause(audioFinaleWin))
document.getElementById("playFinaleLose").addEventListener("click", () => playOrPause(audioFinaleLose))

socket.on("soundOff", () => {
    stopSound(audioBed)
    stopSound(audioFinale)
})

window.addEventListener("keydown", handleKeyDown, true)

function handleKeyDown(event) {
    // console.log(state)

    let letter = ""
    let audio

    if (event.type == "click") {
        letter = event.target.id.toUpperCase()
        event.target.blur()
    } else if (event.type == "keydown") {
        letter = event.key.toUpperCase()
    }

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
            // 13ème ?
        ) {
            stopSound(audioBed)
            stopSound(audioSuspense)
            audioBuzz.play()
            setTimeout(() => {
                document.querySelector("body").classList.replace("bg-dark", "bg-warning")
                setTimeout(() => {
                    document.querySelector("body").classList.replace("bg-warning", "bg-dark")
                }, 100)
            }, 5000)
            // startTimer(3000)
        }
        // if (letter == "B") {
        //     console.log('object')
        //     const audio = new Audio("../sound/correct.m4a").play()
        //     // startTimer(3000)
        // }
    }

    // Envois depuis BT Serial

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

    // if (letter == "BACKSPACE") {
    //     const audio = new Audio("../sound/buzz.m4a")
    //     audio.volume = 0.4
    //     audio.play()
    // }

    if (letter == " ") {
        event.preventDefault()
        playOrPause(audioBed)
    }
    if (letter == "G") playOrPause(audioGenerique)
    if (letter == "C") playOrPause(audioSuspense)
    if (letter == "K") playOrPause(audioFinale)
    if (letter == "H") playOrPause(audioSting)
    if (letter == "J") playOrPause(audioStingFinale)
    if (letter == "B") playOrPause(audioFinaleWin)
    if (letter == "N") playOrPause(audioFinaleLose)

    if (letter == "C") {
    }
}

const playOrPause = (track) => {
    if (track.paused) {
        track.play()
    } else {
        track.pause()
        track.currentTime = 0
    }
}

const stopSound = (track) => {
    track.pause()
    track.currentTime = 0
}

// variable to store our intervalID
let nIntervId

function stopTimer() {
    state = "IDLE"
    clearInterval(nIntervId)
    // release our intervalID from the variable
    nIntervId = null
}

// #####

function displayRoundButtons(activeRound) {
    document.querySelectorAll(".roundButton").forEach((button) => {
        button.classList.remove("btn-warning")
        button.classList.add("btn-secondary")
    })
    document.querySelector(`#${activeRound}`).classList.add("btn-warning")
}

function displayCategoryButtons(activeCategory) {
    document.querySelectorAll(".category").forEach((button) => {
        button.classList.remove("btn-warning")
        button.classList.add("btn-secondary")
    })
    document.querySelector(`#${activeCategory}`).classList.add("btn-warning")
}
