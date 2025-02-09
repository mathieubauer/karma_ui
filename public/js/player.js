import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown, updateCountdown } from "./components/countdown.js"
import { buildOpenQuestionContainer, buildQuestionContainer } from "./components/question.js"
import { buildLogo } from "./components/logo.js"
import { buildPseudoInput } from "./components/pseudo.js"
import { buildBuzzer } from "./components/buzzer.js"
import ElementBuilder from "./components/ElementBuilder.js"
import { buildCategoryBoard } from "./components/category.js"
import { buildAnswerInputContainer } from "./components/answerInput.js"

const page = document.querySelector(".mainContainer")

const categoryMap = {
    // doit être identique à categoryMap.js
    sav: "Savoirs académiques",
    // pop: "Pop culture, loisirs et sports",
    pop: "Pop culture",
    loi: "Loisirs et sports",
    vie: "Vie quotidienne",
    con: "Connaissance du monde",
    fin: "Finale",
    eli: "Éliminatoire",
    man: "Manche 1",
}

let localElementStates = {}

// Vérification de l'identification

const pseudo = localStorage.getItem("pseudo")
if (pseudo) {
    socket.emit("join", pseudo)
} else {
    page.innerHTML = ""
    page.appendChild(buildPseudoInput())
}

// #####

// Gestion des affichages

socket.on("updateElementStates", (elementStates) => {
    const pseudo = localStorage.getItem("pseudo")
    if (!pseudo) {
        page.innerHTML = ""
        page.appendChild(buildPseudoInput())
        return
    }

    // console.log(elementStates)
    localElementStates = elementStates
    page.innerHTML = ""

    if (elementStates.pseudo) {
        buildPseudoInput()
        return
    }

    if (elementStates.round || elementStates.round == 0) {
        if (elementStates.round == 11) {
            // Round 1 avec buzzers
            page.appendChild(buildBuzzer(elementStates))
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

        if (elementStates.round == 21) {
            // affichage des catégories disponibles
            if (elementStates.questionListCategories) {
                page.appendChild(buildCategoryBoard(elementStates.questionListCategories))
            }
            return
        }

        if (elementStates.round == 3 || elementStates.round == 12) {
            // finale ou affichage des questions en manche 1
            const fullPage = new ElementBuilder("div")
                .setId("fullPageContainer") //
                .addChild(buildQuestionContainer())
                .build()
            page.appendChild(fullPage)
            if (elementStates.currentCategory) {
                document.querySelector("#question-category").textContent = categoryMap[elementStates.currentCategory]
            }
            showQuestion(elementStates.currentQuestion)
            return
        }

        if (elementStates.round == 13) {
            // questions ouvertes à réponses écrites
            const fullPage = new ElementBuilder("div")
                .setId("fullPageContainer") //
                .addClass("flex-column")
                .addChild(buildQuestionContainer())
                .addChild(buildAnswerInputContainer())
                .build()
            page.appendChild(fullPage)
            if (elementStates.currentCategory) {
                document.querySelector("#question-category").textContent = categoryMap[elementStates.currentCategory]
            }
            showQuestion(elementStates.currentQuestion)
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

socket.on("questionUpdate", ({ question }) => {
    showQuestion(question)
})

socket.on("display_empty", () => {
    page.innerHTML = ""
    buildLogo()
})

socket.on("playSound", ({ track }) => {
    playOrPause(track)
})

// buzzers, pour ne pas recharger toute la page

socket.on("buzzerOn", () => {
    const buzzerButton = document.getElementById("buzzerButton")
    if (buzzerButton) {
        buzzerButton.setAttribute("data-disabled", false)
    }
})

/////

function showQuestion(question) {
    const questionElement = document.querySelector("#question")
    if (questionElement) {
        if (typeof question === "object" && question.question) {
            // Si c'est un objet avec une propriété 'question'
            questionElement.textContent = question.question
        } else if (typeof question === "string") {
            // Si c'est une chaîne de caractères, y compris ""
            questionElement.textContent = question
        } else {
            // Cas où question est null, undefined, ou invalide
            questionElement.textContent = ""
        }
    }
}

// ONLOAD

// Loads de l'ancienne version

// buildPseudoInput()
// buildOpenQuestionContainer()