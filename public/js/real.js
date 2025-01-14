import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown } from "./components/countdown.js"
import { showToast } from "./components/toast.js"
import ElementBuilder from "./components/ElementBuilder.js"

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
    // Éléments dynamiques
    const questionsFinale = document.querySelector("#questionsFinale")
    questionsFinale.innerHTML = ""

    if (elementStates.round || elementStates.round == 0) {
        // TODO, vérifier ça
        if (elementStates.round == 0) displayRoundButtons("display_empty")
        if (elementStates.round == 11) displayRoundButtons("display_round1") // Round1 avec buzzers
        if (elementStates.round == 12) displayRoundButtons("display_round1_questions") // Round1 avec questions
        if (elementStates.round == 2) displayRoundButtons("display_round2")
        if (elementStates.round == 21) displayRoundButtons("display_round2_choices")
    }

    if (elementStates.questionListName) {
        document.querySelector("#questionListName").textContent = elementStates.questionListName
    }

    if (elementStates.questionListCategories) {
        const categoryButtonsContainer = document.querySelector("#categoryButtons")
        categoryButtonsContainer.innerHTML = ""

        const categoryButtonsDisplayContainer = document.querySelector("#categoryButtonsToDisplay")
        categoryButtonsDisplayContainer.innerHTML = ""

        elementStates.questionListCategories.forEach((category) => {
            const button = new ElementBuilder("button")
                .setId(category.code) // Prend les trois premiers char
                .addClass("btn btn-secondary btn-sm category me-2 my-1 p-2 text-uppercase fw-bold")
                .setAttribute("type", "button")
                .setText(`${category.name}`)
                .addEvent("click", () => {
                    socket.emit("category", { newCategory: category.code })
                })
                .build()
            categoryButtonsContainer.appendChild(button)

            const buttonDisplay = new ElementBuilder("button")
                .addClass("displayCategoryButton btn  me-2 my-1 p-2 text-uppercase fw-bold")
                .addClass(`${category.isAvailable ? "btn-warning" : "btn-outline-secondary"}`)
                .setAttribute("type", "button")
                .setAttribute("data-category", category.code) // trois premières lettres
                .setText(`${category.name}`)
                .addEvent("click", (event) => {
                    socket.emit("displayCategory", { categoryToToggle: event.target.dataset.category })
                    socket.emit("category", { newCategory: event.target.dataset.category })
                })
                .build()
            categoryButtonsDisplayContainer.appendChild(buttonDisplay)
        })
    }

    if (elementStates.currentCategory && elementStates.currentCategory != "man" && elementStates.currentCategory != "fin") {
        // exception pour la manche 1 et pour la finale
        displayCategoryButtons(elementStates.currentCategory)
    }

    if (elementStates.selectedQuestions.length > 0) {
        const container = document.querySelector("#allQuestionsContainer")
        const containerR1 = document.querySelector("#allQuestionsContainerRound1")
        container.innerHTML = ""
        containerR1.innerHTML = ""
        elementStates.selectedQuestions.forEach((question, index) => {
            const div = new ElementBuilder("div") //
                .addClass("question mb-1")
                .setHTML(
                    `<span class="text-secondary">${index + 1}</span> <span class="fw-bold">${question.question}</span> - ${
                        question.answer
                    }`,
                )
                .build()
            if (elementStates.currentCategory == "man") {
                containerR1.appendChild(div)
            } else {
                container.appendChild(div)
            }
        })
    }

    if (elementStates.isRunning !== undefined && elementStates.remainingTime !== undefined && elementStates.endTime !== undefined) {
        const realCountdown = document.querySelector("#realCountdown")
        realCountdown.innerHTML = ""
        // document.querySelector('#realCountdown').appendChild(buildCountdown(elementStates.remainingTime))
        realCountdown.appendChild(buildCountdown())
        if (elementStates.isRunning) {
            startCountdown(elementStates.endTime)
        } else {
            pauseCountdown(elementStates.remainingTime)
        }
    }

    if (elementStates.scoreA !== undefined && elementStates.scoreB !== undefined) {
        const realScoreboard = document.querySelector("#realScoreboard")
        realScoreboard.innerHTML = ""
        realScoreboard.appendChild(buildScoreBoard())
        updateScores(elementStates.scoreA, elementStates.scoreB)
    }

    document.querySelector("#question").innerHTML = elementStates.currentQuestion ? elementStates.currentQuestion.question : ""
    document.querySelector("#answer").innerHTML = elementStates.currentQuestion ? elementStates.currentQuestion.answer : ""

    if (!elementStates.currentQuestion) {
        document.querySelector("#right").disabled = true
        document.querySelector("#wrong").disabled = true
        document.querySelector("#steal").disabled = true
    } else {
        document.querySelector("#right").disabled = false
        document.querySelector("#wrong").disabled = false
        // document.querySelector("#steal").disabled = false
    }

    if (elementStates.activePlayer !== undefined) {
        document.getElementById("buzzResultsContainer").innerHTML = elementStates.activePlayer
    }

    // FINALE

    if (elementStates.round == 3) {
        if (elementStates.selectedQuestions.length > 0) {
            elementStates.selectedQuestions.forEach((question, index) => {
                const orderText = new ElementBuilder("span").addClass("text-secondary").setText(`${question.order}`).build()
                const questionText = new ElementBuilder("span").addClass("fw-bold").setText(`${question.question}`).build()
                const answerText = new ElementBuilder("span").setText(` - ${question.answer}`).build()

                const questionContainer = new ElementBuilder("div")
                    .addClass("question mb-1")
                    .addChild(orderText)
                    .addChild(new ElementBuilder("span").setText(" ").build()) // espace entre index et question
                    .addChild(questionText)
                    .addChild(answerText)
                    .addEvent("click", () => {
                        socket.emit("sendQuestion", question)
                    })
                    .build()

                questionsFinale.appendChild(questionContainer)
            })
        }
    }
})

function round1() {
    socket.emit("round", { newRound: 1 })
    socket.emit("category", { newCategory: "man" })
}

function finale() {
    socket.emit("round", { newRound: 3 })
    socket.emit("category", { newCategory: "fin" })
    // socket.emit("playSound", { trackName: "finale" })
}

document.querySelectorAll('#dashboardTabs button[data-bs-toggle="tab"]').forEach((tabButton) => {
    tabButton.addEventListener("shown.bs.tab", (event) => {
        if (event.target.id == "accueil-tab") socket.emit("round", { newRound: 0 })
        if (event.target.id == "manche1-tab") round1()
        if (event.target.id == "manche2choix-tab") socket.emit("round", { newRound: 21 })
        if (event.target.id == "manche2aff-tab") socket.emit("round", { newRound: 2 })
        if (event.target.id == "manche2elim-tab") socket.emit("round", { newRound: 0 })
        if (event.target.id == "finale-tab") finale()
    })
})

// Affichage de l'écran joueur #####

document.getElementById("display_empty").addEventListener("click", () => {
    socket.emit("round", { newRound: 0 })
})

document.getElementById("display_round1").addEventListener("click", () => {
    socket.emit("round", { newRound: 11 }) // round 1 avec buzzers
})

document.getElementById("display_round1_questions").addEventListener("click", () => {
    socket.emit("round", { newRound: 12 }) // round 1 avec buzzers
})

document.getElementById("display_round2").addEventListener("click", () => {
    socket.emit("round", { newRound: 2 })
})

document.getElementById("display_round2_choices").addEventListener("click", () => {
    socket.emit("round", { newRound: 21 })
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
        if (button.disabled) return
        setCooldown(button, 2000)
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
        document.querySelector("#steal").disabled = false
        // document.querySelector("#steal").classList.add("btn-warning")
    } else {
        audioBed.play()
        isAffrontementPlaying = true
        document.querySelector("#right").classList.add("btn-success")
        document.querySelector("#steal").disabled = true
        // document.querySelector("#steal").classList.remove("btn-warning")
    }
})

document.querySelector("#steal").addEventListener("click", () => {
    if (isAffrontementPlaying) {
        //
    } else {
        audioBed.play()
        isAffrontementPlaying = true
        document.querySelector("#right").classList.add("btn-success")
        document.querySelector("#steal").disabled = true
    }
})

// Reset score

document.getElementById("resetScore").addEventListener("click", () => {
    socket.emit("resetScore")
})

// Gestion des questionnaires

document.getElementById("questionFileForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const select = document.getElementById("questionFileSelect")
    const selectedFile = select.value
    if (selectedFile) {
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

function setCooldown(button, cooldownTime = 1000) {
    button.disabled = true // Désactiver le bouton
    button.classList.add("disabled") // Ajoute une classe (optionnel pour du style)

    setTimeout(() => {
        button.disabled = false // Réactiver le bouton
        button.classList.remove("disabled") // Retire la classe (optionnel pour du style)
    }, cooldownTime)
}