import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown, updateCountdown } from "./components/countdown.js"
import { buildOpenQuestionContainer, buildQuestionContainer } from "./components/question.js"
import { buildLogo } from "./components/logo.js"
import { buildPseudoInput, checkUsername } from "./components/pseudo.js"

const page = document.querySelector(".mainContainer")

const categoryMap = {
    aca: "Savoirs académiques",
    pop: "Pop culture, loisirs et sports",
    vie: "Vie quotidienne",
    mon: "Connaissance du monde",
}

let localElementStates = {}

// Vérification de l'identification

const pseudo = localStorage.getItem("pseudo")
if (pseudo) {
    socket.emit("join", pseudo)
} else {
    page.innerHTML = ""
    buildPseudoInput()
}

// #####

// Gestion des affichages

socket.on("updateElementStates", (elementStates) => {
    // console.log(elementStates)
    localElementStates = elementStates
    page.innerHTML = ""

    if (elementStates.pseudo) {
        buildPseudoInput()
        return
    }

    if (elementStates.round || elementStates.round == 0) {
        if (elementStates.round == 1) {
            buildBuzzer()
            return
        }

        if (elementStates.round == 2) {
            page.appendChild(buildCountdown(elementStates.remainingTime))
            if (elementStates.isRunning) {
                startCountdown(elementStates.endTime)
            } else {
                pauseCountdown(elementStates.remainingTime)
            }

            page.appendChild(buildQuestionContainer())
            if (elementStates.currentCategory) {
                document.querySelector("#question-category").textContent = categoryMap[elementStates.currentCategory]
            }
            showQuestion(elementStates.currentQuestion)

            page.appendChild(buildScoreBoard())
            updateScores(elementStates.scoreA, elementStates.scoreB)

            return
        }
    }

    Object.entries(elementStates).forEach(([elementId, value]) => {
        if (elementId == "questionContainer" && value) buildOpenQuestionContainer()
        if (elementId == "currentQuestion") showQuestion(value)
    })

    if (page.innerHTML == "") {
        page.appendChild(buildLogo())
    }
})

// #####

socket.on("chronoUpdate", ({ isRunning, remainingTime, endTime }) => {
    if (isRunning) {
        startCountdown(endTime)
    } else {
        pauseCountdown(remainingTime)
    }
})

socket.on("questionUpdate", ({ question }) => {
    showQuestion(question)
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

// buildPseudoInput()
// buildOpenQuestionContainer()
