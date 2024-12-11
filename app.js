const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const hbs = require('hbs')
const { questionSelector, questionSelectorGame } = require('./questionSelector')
const loadQuestions = require('./loadQuestions')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './views')
const partialsPath = path.join(__dirname, './views/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

//

const duration = 45 * 1000
let remainingTime = duration
let endTime = 0
let isRunning = false
let category
let activeTeam
let scores = {
    teamA: 0,
    teamB: 0
}

let allQuestions = []
let questions = []
let selectedQuestions = []
let questionIndex = 0

const connectedUsers = {}

const elementStates = {
    round: 0,
    pseudo: false,
    buzzerActive: false,
    questionContainer: false,
    answerInput: false,
    countdown: false,
    score: false,
    currentQuestion: "",
}


/**
 * Met tout le fichier dans questions
 */
loadQuestions("karma_game_010.csv")
    // loadQuestions('karma_lpgqdf.csv')
    .then((loadedQuestions) => {
        questions = loadedQuestions
        questionsLoaded = true
        console.log(questions.length + " questions chargées")
    })
    .catch((error) => console.error("Erreur lors du chargement des questions:", error))

loadQuestions("karma_lpgqdf.csv")
    .then((loadedQuestions) => {
        allQuestions = loadedQuestions
        // questionsLoaded = true
        console.log(allQuestions.length + " questions chargées")
    })
    .catch((error) => console.error("Erreur lors du chargement des questions:", error))

const pauseCount = () => {
    if (!isRunning) return
    isRunning = false
    remainingTime = endTime - Date.now()
    io.emit("chronoUpdate", { endTime, isRunning })
}

const startCount = () => {
    if (isRunning) return
    isRunning = true
    endTime = Date.now() + remainingTime
    io.emit("chronoUpdate", { endTime, isRunning })
}

const resetCount = () => {
    isRunning = false
    remainingTime = duration
    endTime = Date.now() + remainingTime
    io.emit("chronoUpdate", { endTime, isRunning })
}

io.on("connection", (socket) => {
    const userId = socket.id
    console.log("Un utilisateur s'est connecté: " + userId)

    socket.emit("updateElementStates", elementStates)
    socket.emit("checkUsername")

    socket.on("join", (pseudo) => {
        socket.userData = { id: socket.id, pseudo }
        connectedUsers[socket.id] = socket.userData
        console.log("User joined:", connectedUsers[socket.id]) // Vérifie que l'utilisateur est bien ajouté
        io.emit("connectedPlayers", Object.values(connectedUsers))
        socket.emit("updateElementStates", elementStates)
    })

    if (!isRunning) {
        endTime = Date.now() + remainingTime
    }
    // endTime = Date.now() + remainingTime

    // Seulement au client qui vient de se connecter
    // socket.emit("updateElementStates", elementStates)

    if (elementStates.round == 1) socket.emit("display_round1")
    if (elementStates.round == 2) socket.emit("display_round2")

    // À tous les clients
    io.emit("chronoUpdate", { endTime, isRunning })
    io.emit("scoreUpdate", { scores })
    // io.emit("questionUpdate", { question: selectedQuestions[questionIndex] }) // on reload
    io.emit("displayCategory", { category })
    io.emit("teamUpdate", { activeTeam })

    socket.on("start", ({ startTeam }) => {
        if (!category) {
            socket.emit("displayError", {
                error: "Veuillez choisir une catégorie",
            })
            return
        }

        startCount()

        if (startTeam == "startA") activeTeam = "A"
        if (startTeam == "startB") activeTeam = "B"
        io.emit("teamUpdate", { activeTeam })

        let firstQuestion = 0
        if (activeTeam == "B") firstQuestion = +5
        selectedQuestions = questionSelectorGame(questions, category, firstQuestion)
        io.emit("questionUpdate", {
            question: selectedQuestions[questionIndex],
        })
        firstQuestion = 0
    })

    socket.on("draw", () => {
        if (!category) {
            socket.emit("displayError", {
                error: "Veuillez choisir une catégorie",
            })
            return
        }

        selectedQuestions = questionSelectorGame(questions, category, 10)
        io.emit("questionUpdate", {
            question: selectedQuestions[questionIndex],
        })
    })

    socket.on("requestQuestion", () => {
        io.emit("receiveQuestion", {
            question: questionSelector(allQuestions, null, 1)[0],
        })
    })

    socket.on("pause", () => {
        pauseCount()
    })

    socket.on("reset", () => {
        // RESET TIME
        resetCount()
        activeTeam = null
        io.emit("teamUpdate", { activeTeam })
        questionIndex = 0
        selectedQuestions = []
        io.emit("questionUpdate", { question: null })
    })

    socket.on("resetScore", () => {
        scores.teamA = 0
        scores.teamB = 0
        io.emit("scoreUpdate", { scores })
    })

    socket.on("category", ({ newCategory }) => {
        category = newCategory
        io.emit("displayCategory", { category })
    })

    socket.on("decision", ({ decision }) => {
        if (decision == "wrong" && isRunning) {
            pauseCount()
        } else if (decision == "wrong" && !isRunning) {
            startCount()
            questionIndex++
        }

        if (questionIndex < 5 + 1) {
            if (decision == "right") {
                if (activeTeam == "A") scores.teamA += 1
                if (activeTeam == "B") scores.teamB += 1
                startCount()
                questionIndex++
            }
            if (decision == "steal") {
                if (activeTeam == "A") scores.teamB += 1
                if (activeTeam == "B") scores.teamA += 1
                startCount()
                questionIndex++
            }
            io.emit("scoreUpdate", { scores })
        }

        if (questionIndex < 5) {
            io.emit("questionUpdate", {
                question: selectedQuestions[questionIndex],
            })
        }

        if (questionIndex == 5) {
            pauseCount()
            io.emit("questionUpdate", { question: null })
            io.emit("soundOff")
            setTimeout(function () {
                resetCount()
                activeTeam = null
                io.emit("teamUpdate", { activeTeam })
                questionIndex = 0
                selectedQuestions = []
                io.emit("questionUpdate", { question: null })
            }, 10000)
        }
    })

    // Display rounds

    socket.on("display_empty", () => {
        elementStates.round = 0
        // io.emit("display_empty")
        io.emit("updateElementStates", elementStates)
        io.emit("checkUsername")
    })

    socket.on("display_round1", () => {
        elementStates.round = 1
        // io.emit("display_round1")
        io.emit("updateElementStates", elementStates)
        io.emit("checkUsername")
    })

    socket.on("display_round2", () => {
        elementStates.round = 2
        // io.emit("display_round2")
        io.emit("updateElementStates", elementStates)
        io.emit("checkUsername")
    })

    socket.on("changeElementVisibility", ({ elementId, isVisible }) => {
        elementStates[elementId] = isVisible
        io.emit("updateElementStates", elementStates)
        io.emit("checkUsername")
    })

    // Questions ouvertes

    socket.on("sendQuestion", (question) => {
        elementStates.currentQuestion = question.question
        io.emit("questionUpdate", question.question)
    })

    socket.on("sendAnswer", (answer) => {
        const userData = connectedUsers[socket.id]
        if (userData) {
            io.emit("playerAnswer", {
                id: userData.id,
                pseudo: userData.pseudo,
                answer,
            })
        }
    })

    // Gestion des utilisateurs connectés

    socket.on("hostConnected", () => {
        socket.emit("connectedPlayers", Object.values(connectedUsers))
    })

    socket.on("disconnect", () => {
        const userData = connectedUsers[socket.id]
        if (userData) {
            delete connectedUsers[socket.id]
            io.emit("connectedPlayers", Object.values(connectedUsers))
        }
    })

    // Buzzers

    socket.on("activateBuzzer", () => {
        elementStates.buzzerActive = true
        io.emit("updateElementStates", elementStates)
        io.emit("checkUsername")
    })

    socket.on("playerBuzzed", ({ playerId, timestamp }) => {
        if (!elementStates.buzzerActive) return // Si les buzzers ne sont pas actifs, on ignore
        elementStates.buzzerActive = false
        io.emit("buzzerLocked")
        io.emit("buzzResults", playerId)
    })

    // socket.on('timerEnded', () => {
    //     console.log('timer ended')
    //     setTimeout(function() {
    //         resetCount()
    //         io.emit('teamUpdate', { activeTeam: null })
    //         questionIndex = 0
    //         selectedQuestions = []
    //         io.emit('questionUpdate', { question: null })
    //     }, 5000)
    // })
})

// app.get("/", (req, res) => {
//     res.render("index", {
//         layout: "layouts/main",
//         demo: "hello world : /real, /host & /player",
//     })
// })

app.get("/", (req, res) => {
    res.render("player", {
        layout: "layouts/main",
    })
})

app.get("/real", (req, res) => {
    res.render("real", {
        layout: "layouts/main",
        questions,
        questionsElim: questionSelector(questions, "eli"),
        questionsFinale: questionSelector(questions, "fin"),
    })
})

app.get('/host', (req, res) => {
    res.render('host', {
        layout: 'layouts/main',
    })
})

app.get('/builder', (req, res) => {
    res.render('builder', {
        layout: 'layouts/main',
    })
})



server.listen(port, () => {
    console.log(`server is up on port ${ port }`)
})


// TODO - Tout reprendre
// [] Garder l'état de la manche actuelle côté serveur
//      [] Accueil : auth ou logo
//      [] Manche 1 : auth ou buzzers
//      [] Manche 2 : écran spécial
//      [] Finale : écran spécial + système de vote
// [x] Héberger !!!
// [] Faire une première manche avec 20 questions sélectionnées
//      [] Les tester dans questions_v3 / quiz
//      [] Base de donneés ? Mongoose ? Ou dans Questions ?
// [] rendre beau côté /real
// [] compter les points : système de réponses attendues tolérant + comptage de points manuel (ajouter / enlever)

// TODO
// [x] bootstrap hors ligne
// [x] mettre les fonction de sélection des questionnaires dans un autre fichier
// [x] commencer à 45 plutôt que 44:99
// [x] prochaine question, afficher aussi dans vue player
// [x] affichage du nombre de bonnes réponses
// [x] choix du thème
// [x] afficher le thème actif + alerte quand aucun thème
// [x] afficher l'équipe qui joue
// [x] raccourcis clavier
// [x] sons
// [x] vérifier tous les états au refresh (chrono, question active, catégorie active, équipe active, scores)
// [x] reset scores 
// [] ajouter les ID de questions ?
// [] néon ui : https://css-tricks.com/how-to-create-neon-text-with-css/
// [] créer un préparateur de questionnaires (donner 15 questions à équilibrer en deux séries de 5 et une éliminatoire, permettre la modification)
// [x] UI host, centré dans l'écran, couleurs KARMA
// [] bed pour les affrontements, avec un son de fin
// [] Il faut donner le dernière réponse avant le fin des 45 secondes. Si on n'a pas joué toutes les questions, les adversaires les jouent.

// pour second device : http://192.168.X.X:3001/player (si connecté sur le même WiFi)

// projet UI Karma
//     - affichage questions et chrono
//     - Affichage animateur: réponse attendue + boutons de validation
//     - base de donnée des questions, par thème(peut - on mettre toutes les questions dans les catégories / sous - catégories ?)

// Projet Manche 1
// [] Préparer un jeu de questions à l'avance avec des points attribués
// [] Pouvoir modifier la question à la volée en cas de problème
// [] Afficher les scores de chaque joueur (show Leaderboard)
// [] Conserver la liste des réponses et des points on refresh


// [] Générer un QR code avec le lien vers l'adresse en local ?
