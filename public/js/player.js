import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown } from "./components/countdown.js"
import { buildOpenQuestionContainer, buildQuestionContainer } from "./components/question.js"
import { buildLogo } from "./components/logo.js"
import { buildPseudoInput, checkUsername } from "./components/pseudo.js"

const page = document.querySelector("#page")
let localElementStates = {}

// Gestion des affichages

socket.on("checkUsername", () => {
    checkUsername()
})

socket.on("updateElementStates", (elementStates) => {
    localElementStates = elementStates
    page.innerHTML = ""
    // console.log("updateElementStates", elementStates)
    Object.entries(elementStates).forEach(([elementId, value]) => {
        if (elementId == "pseudo" && value) {
            buildPseudoInput()
            return
        }

        if (elementId == "round") {
            if (value == 1) {
                buildBuzzer()
                return
            }
            if (value == 2) {
                buildCountdown()
                buildScoreBoard()
                buildQuestionContainer()
                return
            }
        }

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

socket.on("questionUpdate", ({ question }) => {
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

// buzzers, pour ne pas recharger toute la page

socket.on("buzzerOn", () => {
    const buzzerButton = document.getElementById("buzzerButton")
    if (buzzerButton) {
        buzzerButton.disabled = false
    }
})

socket.on("buzzed", (pseudo) => {
    const buzzerButton = document.getElementById("buzzerButton")
    if (buzzerButton) {
        buzzerButton.disabled = true
    }

    const savedPseudo = localStorage.getItem("pseudo")
    if (savedPseudo == pseudo) {
        buzzerButton.classList.add("first")
    }
})

/////

function showQuestion(question) {
    const questionElement = document.querySelector("#question")
    if (questionElement) {
        questionElement.innerHTML = question ? question.question : ""
    }
}

// à passer dans un constructeur de buzzer dédié

function buildBuzzer() {
    const buzzerButton = document.createElement("button")
    buzzerButton.id = "buzzerButton"
    buzzerButton.disabled = !localElementStates.buzzerActive
    page.appendChild(buzzerButton)

    buzzerButton.addEventListener("click", () => {
        const pseudo = localStorage.getItem("pseudo") || "Anonymous"
        socket.emit("playerBuzzed", { pseudo })
        buzzerButton.disabled = true
    })
}

// ONLOAD

// Loads de l'ancienne version
// buildCountdown()
// buildScoreBoard()
// buildQuestionContainer()

// buildPseudoInput() 
// buildOpenQuestionContainer()


