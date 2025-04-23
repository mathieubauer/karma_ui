import socket from "./components/socket.js"
import { buildScoreBoard, updateScores } from "./components/score.js"
import { buildCountdown, startCountdown, pauseCountdown } from "./components/countdown.js"
import { showToast } from "./components/toast.js"
import ElementBuilder from "./components/ElementBuilder.js"
import { notes } from "./components/notes.js"

// Déclaration des sons
const audioBuzz = new Audio("../sound/hit_01.mp3")
const audioRight = new Audio("../sound/correct_alt.mp4")
const audioRight2 = new Audio("../sound/correct_alt.mp4") // pour double point
const audioWrong = new Audio("../sound/wrong.m4a")

const audioBed = new Audio("../sound/affrontement__44.mp3")
audioBed.volume = 0.4
const audioExtro = new Audio("../sound/extro.mp4")
audioExtro.volume = 0.4
const audioGenerique = new Audio("../sound/generique_karma.m4a")
audioGenerique.volume = 0.4
const audioSuspense = new Audio("../sound/suspense.mp3")
audioSuspense.volume = 0.4
const audioFinale = new Audio("../sound/finale_loop.mp3") // ex finale_long.mp3 ex finale_full
audioFinale.volume = 0.4
const audioSting = new Audio("../sound/sting.mp3")
audioSting.volume = 0.6
const audioStingFinale = new Audio("../sound/pre_finale.m4a")
audioStingFinale.volume = 0.4
const audioFinaleWin = new Audio("../sound/finale_win.mp3")
audioFinaleWin.volume = 0.4
const audioFinaleLose = new Audio("../sound/finale_lose.mp3")
audioFinaleLose.volume = 0.4

// Variables
let isAffrontementPlaying = false

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
        if (elementStates.round == 13) displayRoundButtons("display_round1_questions_text") // Round1 avec réponses écrites
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
        realCountdown.appendChild(buildCountdown())
        if (elementStates.isRunning) {
            startCountdown(elementStates.endTime)
            audioBed.play()
        } else {
            pauseCountdown(elementStates.remainingTime)
            if (elementStates.remainingTime > 0) {
                audioBed.pause()
                // sinon on laisse le gong
            }
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
        document.getElementById("infoReal").innerHTML = elementStates.activePlayer
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

socket.on("teamUpdate", ({ activeTeam }) => {
    // onload
    // TODO, devrait être un elementState
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

// Affichage de l'écran joueur & écran plateau #####

document.getElementById("display_empty").addEventListener("click", () => {
    socket.emit("round", { newRound: 0 })
})

document.getElementById("display_round1").addEventListener("click", () => {
    socket.emit("round", { newRound: 11 }) // round 1 avec buzzers
})

document.getElementById("display_round1_questions").addEventListener("click", () => {
    socket.emit("round", { newRound: 12 })
})

document.getElementById("display_round1_questions_text").addEventListener("click", () => {
    socket.emit("round", { newRound: 13 }) // round 1 avec réponses écrites
})

document.getElementById("display_round2").addEventListener("click", () => {
    socket.emit("round", { newRound: 2 })
})

document.getElementById("display_round2_choices").addEventListener("click", () => {
    socket.emit("round", { newRound: 21 })
})

// CONTROLES REAL ########################################

// Onglet #####

function round1() {
    socket.emit("round", { newRound: 1 })
    socket.emit("category", { newCategory: "man" })
}

function finale() {
    socket.emit("round", { newRound: 3 })
    socket.emit("category", { newCategory: "fin" })
    // double emit elementState
    // socket.emit("playSound", { trackName: "finale" })
}

document.querySelectorAll('#dashboardTabs button[data-bs-toggle="tab"]').forEach((tabButton) => {
    tabButton.addEventListener("shown.bs.tab", (event) => {
        socket.emit("sendQuestion", "") // vide la question

        if (event.target.id == "accueil-tab") socket.emit("round", { newRound: 0 })
        if (event.target.id == "manche1-tab") round1()
        // if (event.target.id == "manche2choix-tab") socket.emit("round", { newRound: 21 })
        if (event.target.id == "manche2choix-tab") socket.emit("round", { newRound: 0 }) // logo au début de manche
        if (event.target.id == "manche2aff-tab") socket.emit("round", { newRound: 2 })
        if (event.target.id == "manche2elim-tab") socket.emit("round", { newRound: 0 })
        if (event.target.id == "finale-tab") finale()
    })

    tabButton.addEventListener("hidden.bs.tab", (event) => {
        if (event.target.id === "finale-tab") socket.emit("resetFinale")
    })
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
        //audioBed.play()
        isAffrontementPlaying = true
    })
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
        if (decision == "right") audioRight.play()
        if (decision == "steal") {
            audioRight.play()
            setTimeout(() => {
                audioRight2.play()
            }, 400)
        }
    })
})

// TODO: vérifier si on ne peut pas regrouper ?

document.querySelector("#wrong").addEventListener("click", () => {
    if (isAffrontementPlaying) {
        //audioBed.pause()
        isAffrontementPlaying = false
        document.querySelector("#right").classList.remove("btn-success")
        document.querySelector("#steal").disabled = false
        // document.querySelector("#steal").classList.add("btn-warning")
    } else {
        // TODO: mettre un controle
        // ça relance quand on a un wrong après les 45 secondes (pour répondre après la fin du chrono)
        // isAffrontementPlaying, similaire à isRunning ?
        //audioBed.play()
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
        //audioBed.play()
        isAffrontementPlaying = true
        document.querySelector("#right").classList.add("btn-success")
        document.querySelector("#steal").disabled = true
    }
})

// Reset score

document.getElementById("resetScore").addEventListener("click", () => {
    socket.emit("resetScore")
})

document.querySelectorAll(".scoreFinale").forEach((button) => {
    button.addEventListener("click", (event) => {})
})

const finaleStates = [
    { name: "empty", buttonLabel: "vide", bsColor: "_" },
    { name: "correct", buttonLabel: "correct", bsColor: "success" },
    { name: "pass", buttonLabel: "passe", bsColor: "warning" },
    { name: "wrong", buttonLabel: "incorrect", bsColor: "danger" },
]

for (let questionIndex = 0; questionIndex < 5; questionIndex++) {
    const buttonGroup = new ElementBuilder("div") //
        .addClass("d-flex")
        .build()

    finaleStates.forEach((state) => {
        const button = new ElementBuilder("button")
            .addClass("btn btn-sm btn-outline-secondary font-monospace w-25")
            .setText(`Q${questionIndex + 1} ${state.buttonLabel}`)
            .setAttribute("data-index", questionIndex)
            .setAttribute("data-result", state.bsColor)
            .addEvent("click", (event) => {
                if (button.disabled) return
                setCooldown(button, 2000)
                const questionIndex = parseInt(event.target.dataset.index)
                const questionResult = event.target.dataset.result
                socket.emit("scoreFinale", { finaleQuestionIndex: questionIndex, questionResult })
                // play music ? TODO ?
            })
            .build()

        buttonGroup.appendChild(button)
    })
    document.querySelector("#finaleButtons").appendChild(buttonGroup)
}

// ##### ON REPREND TOUT

// function toggleElement(elementId, checkbox) {
//     const isVisible = checkbox.checked
//     socket.emit("changeElementVisibility", { elementId, isVisible })
// }

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
    document.getElementById("infoReal").appendChild(span)
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

socket.on("displayError", ({ error }) => {
    document.querySelector("#question").innerHTML = error
})

// buzzers, manche 1

document.getElementById("activateBuzzerBtn").addEventListener("click", () => {
    socket.emit("activateBuzzer")
})

// ########## Gestion du son ##########

document.getElementById("playGenerique").addEventListener("click", () => playOrPause(audioGenerique))
// document.getElementById("playSting").addEventListener("click", () => playOrPause(audioSting))
document.querySelectorAll(".playSting").forEach((button) => {
    button.addEventListener("click", () => playOrPause(audioSting))
})
document.getElementById("playStingFinale").addEventListener("click", () => playOrPause(audioStingFinale))

document.getElementById("playGameBed").addEventListener("click", () => playOrPause(audioBed))
document.getElementById("playSuspense").addEventListener("click", () => playOrPause(audioSuspense))
document.getElementById("playFinale").addEventListener("click", () => playOrPause(audioFinale))

document.getElementById("playFinaleWin").addEventListener("click", () => playOrPause(audioFinaleWin))
document.getElementById("playFinaleLose").addEventListener("click", () => playOrPause(audioFinaleLose))

socket.on("soundOff", () => {
    stopSound(audioBed)
    stopSound(audioFinale)
    audioExtro.play()
})

window.addEventListener("keydown", handleKeyDown, true)

function handleKeyDown(event) {
    let letter = ""
    let audio

    if (event.type == "click") {
        letter = event.target.id.toUpperCase()
        event.target.blur()
    } else if (event.type == "keydown") {
        letter = event.key.toUpperCase()
    }

    // Map des touches de buzzer vers le numéro de joueur
    const buzzMap = {
        Q: "Joueur 1",
        W: "Joueur 2",
        E: "Joueur 3",
        R: "Joueur 4",
        T: "Joueur 5",
        Y: "Joueur 6",
        U: "Joueur 7",
        I: "Joueur 8",
        O: "Joueur 9",
        P: "Joueur 10",
        A: "Joueur 11",
        S: "Joueur 12",
        D: "Joueur 13",
    }

    const player = buzzMap[letter]
    if (player) {
        stopSound(audioBed)
        stopSound(audioSuspense)
        audioBuzz.play()
        const spanBuzz = document.createElement("span")
        spanBuzz.innerHTML = `Buzz: ${player} <br>`
        document.getElementById("infoReal").appendChild(spanBuzz)
        setTimeout(() => {
            document.querySelector("body").classList.replace("bg-dark", "bg-warning")
            setTimeout(() => {
                document.querySelector("body").classList.replace("bg-warning", "bg-dark")
            }, 100)
        }, 5000)
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

// QR CODE ##########
/*

function generateQRCode(containerId, text, maxSize) {
    const container = document.getElementById(containerId)

    // Calcul de la largeur et hauteur dynamiques
    const size = Math.min(container.offsetWidth, maxSize || 300) // Limite à maxSize si défini

    // Nettoie tout QR code précédent dans le conteneur
    container.innerHTML = ""

    // Génère un nouveau QR code avec les dimensions calculées
    new QRCode(container, {
        text: text,
        width: size - 32, // padding
        height: size - 32,
        colorDark: "#000000",
        colorLight: "#ffffff",
    })
}

generateQRCode("qrcode", "https://ampli.live")

window.addEventListener("resize", function () {
    generateQRCode("qrcode", "https://ampli.live")
})

*/

// Notes

document.querySelector("#accueilNotes").innerHTML = notes.accueil
document.querySelector("#roundOneNotes").innerHTML = notes.roundOne
document.querySelector("#manche2choixNotes").innerHTML = notes.manche2choix
document.querySelector("#manche2choixNotes2").innerHTML = notes.manche2choix2
document.querySelector("#manche2affNotes").innerHTML = notes.manche2aff
document.querySelector("#manche2elimNotes").innerHTML = notes.manche2elim
document.querySelector("#finaleNotes").innerHTML = notes.finale
