import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown, updateCountdown } from "./components/countdown.js"
import { buildOpenQuestionContainer, buildQuestionContainer } from "./components/question.js"
import { buildLogo } from "./components/logo.js"
import { buildPseudoInput } from "./components/pseudo.js"
import { buildBuzzer } from "./components/buzzer.js"
import ElementBuilder from "./components/ElementBuilder.js"
import { buildCategoryBoard } from "./components/category.js"
import { buildFinaleScoreBoard, updateFinaleScores } from "./components/finale.js"

const page = document.querySelector(".mainContainer")

// Déclaration des sons
const audioBuzz = new Audio("../sound/hit_01.mp3")
const audioBed = new Audio("../sound/affrontement__45.mp3") // affrontement_v2 : suspense pour choix
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

const sounds = {
    buzz: audioBuzz,
    affrontement: audioBed,
    generique: audioGenerique,
    suspense: audioSuspense,
    finale: audioFinale,
    sting: audioSting,
    stingFinale: audioStingFinale,
    finaleWin: audioFinaleWin,
    finaleLose: audioFinaleLose,
    right: audioRight,
    wrong: audioWrong,
}

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

    localElementStates = elementStates
    page.innerHTML = ""

    if (elementStates.pseudo) {
        buildPseudoInput()
        return
    }

    if (elementStates.round || elementStates.round == 0) {
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
            console.log(elementStates.currentQuestion)
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

        if (elementStates.round == 11) {
            // Round 1 avec buzzers
            return
        }

        if (elementStates.round == 12 || elementStates.round == 13) {
            // affichage des questions en manche 1 (sans zone de saisie onSet)
            // playOrPause(audioFinale)
            // audioFinale.play()
            const fullPage = new ElementBuilder("div")
                .setId("fullPageContainer") //
                .addClass("flex-column")
                .addChild(buildQuestionContainer())
                .build()
            page.appendChild(fullPage)
            if (elementStates.currentCategory) {
                document.querySelector("#question-category").textContent = categoryMap[elementStates.currentCategory]
            }
            showQuestion(elementStates.currentQuestion)
            return
        }

        if (elementStates.round == 3) {
            // finale ou affichage des questions en manche 1
            // playOrPause(audioFinale)
            // audioFinale.play()
            const fullPage = new ElementBuilder("div")
                .setId("fullPageContainer") //
                .addClass("flex-column")
                .addChild(buildQuestionContainer())
                .addChild(buildFinaleScoreBoard())
                .build()
            page.appendChild(fullPage)
            if (elementStates.currentCategory) {
                document.querySelector("#question-category").textContent = categoryMap[elementStates.currentCategory]
            }

            showQuestion(elementStates.currentQuestion)
            updateFinaleScores(elementStates.scoreFinale)
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

//

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
            // Si c'est une chaîne de caractères
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

// SONS ##########

socket.on("playSound", ({ trackName }) => {
    playSound(trackName)
})

socket.on("pauseSound", ({ trackName }) => {
    pauseSound(trackName)
})

socket.on("resumeSound", ({ trackName }) => {
    resumeSound(trackName)
})

const playSound = (soundName) => {
    const sound = sounds[soundName]
    if (!sound) {
        console.error(`Sound "${soundName}" not found`)
        return
    }

    // Si le son est déjà en cours de lecture, le redémarrer
    if (!sound.paused) {
        sound.pause()
        sound.currentTime = 0
    }

    // Jouer le son
    sound.play().catch((error) => console.error(`Error playing sound "${soundName}":`, error))
}

const pauseSound = (soundName) => {
    const sound = sounds[soundName]
    if (!sound) {
        console.error(`Sound "${soundName}" not found`)
        return
    }

    if (!sound.paused) {
        // Mettre en pause seulement si le son est en cours de lecture
        sound.pause()
    }
}

const resumeSound = (soundName) => {
    const sound = sounds[soundName]
    if (!sound) {
        console.error(`Sound "${soundName}" not found`)
        return
    }

    // Vérifie si le son est en pause avant de le redémarrer
    if (sound.paused) {
        sound.play().catch((error) => console.error(`Error resuming sound "${soundName}":`, error))
    } else {
        console.log(`Sound "${soundName}" is already playing.`)
    }
}

const playOrPause = (soundName) => {
    const sound = sounds[soundName]
    if (!sound) {
        console.error(`Sound "${soundName}" not found`)
        return
    }

    if (sound.paused) {
        // Jouer le son si il est en pause
        sound.play().catch((error) => console.error(`Error playing sound "${soundName}":`, error))
    } else {
        // Mettre le son en pause et le réinitialiser si il est en cours de lecture
        sound.pause()
        sound.currentTime = 0
    }
}
