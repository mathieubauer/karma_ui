import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown } from "./components/countdown.js"
import { buildOpenQuestionContainer, buildQuestionContainer } from "./components/question.js"
import { buildLogo } from "./components/logo.js"
import { buildPseudoInput, checkUsername } from "./components/pseudo.js"

const page = document.querySelector("#page")

// Gestion des affichages

socket.on("updateElementStates", (elementStates) => {
    page.innerHTML = ""
    console.log(elementStates)
    Object.entries(elementStates).forEach(([elementId, value]) => {
        if (elementId == "pseudo" && value) buildPseudoInput()
        if (elementId == "questionContainer" && value) buildOpenQuestionContainer()
        if (elementId == "currentQuestion") showQuestion(value)
        // ...
    })
    if (page.innerHTML == "") {
        buildLogo()
    }
})

// #####

socket.on("chronoUpdate", ({ endTime, isRunning }) => {
    if (isRunning) {
        startCountdown(endTime)
    } else {
        pauseCountdown(endTime)
    }
})

socket.on("questionUpdate", (question) => {
    console.log(question)
    showQuestion(question)
})

socket.on("scoreUpdate", ({ scores }) => {
    updateScores(scores)
})

socket.on("display_empty", () => {
    page.innerHTML = ""
    buildLogo()
})

socket.on("display_round1", (round) => {
    page.innerHTML = ""
    buildOpenQuestionContainer()
})

socket.on("display_round2", () => {
    page.innerHTML = ""
    buildCountdown()
    buildScoreBoard()
    buildQuestionContainer()
})

/////

function showQuestion(question) {
    console.log("show")
    const questionElement = document.querySelector("#question")
    if (questionElement) {
        questionElement.innerHTML = question
    }
}

// ONLOAD

// Loads de l'ancienne version
// buildCountdown()
// buildScoreBoard()
// buildQuestionContainer()

// buildPseudoInput()
// buildOpenQuestionContainer()

checkUsername()
