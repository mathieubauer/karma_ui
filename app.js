const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const hbs = require("hbs")
const { questionSelector, questionSelectorGame, questionSelectorCategory } = require("./questionSelector")
const loadQuestions = require("./loadQuestions")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, "./public")
const viewsPath = path.join(__dirname, "./views")
const partialsPath = path.join(__dirname, "./views/partials")

// Setup handlebars engine and views location
app.set("view engine", "hbs")
app.set("views", viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

//

const duration = 45 * 1000

let activeTeam

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
    questionListName: "",
    questionListCategories: [],
    countdown: false,
    score: false,
    currentCategory: "",
    currentQuestion: "",
    selectedQuestions: [],
    activePlayer: null,
    remainingTime: duration,
    endTime: 0,
    isRunning: false,
    scoreA: 0,
    scoreB: 0,
}

/**
 * Met tout le fichier dans questions
 */
loadQuestions("karma_satisfaction.csv")
    // loadQuestions('karma_lpgqdf.csv')
    .then((loadedQuestions) => {
        questions = loadedQuestions
        const excludedCategories = ["Qualification", "Manche 1", "Finale", "Éliminatoire"]
        const categories = [...new Set(questions.map((item) => item.category))]
            .filter((category) => !excludedCategories.includes(category))
            .map((category) => ({
                name: category,
                code: category.slice(0, 3).toLowerCase(), // Code en minuscule avec des underscores
                isAvailable: true, // Par défaut, on met toutes les catégories à true
            }))
        elementStates.questionListName = "karma_satisfaction.csv"
        elementStates.questionListCategories = categories
        io.emit("updateElementStates", elementStates)
        console.log(questions.length + " questions chargées")
    })
    .catch((error) => console.error("Erreur lors du chargement des questions:", error))

loadQuestions("karma_lpgqdf.csv")
    .then((loadedQuestions) => {
        allQuestions = loadedQuestions
        console.log(allQuestions.length + " questions chargées")
    })
    .catch((error) => console.error("Erreur lors du chargement des questions:", error))

const pauseCount = () => {
    if (!elementStates.isRunning) return
    elementStates.isRunning = false
    elementStates.remainingTime = elementStates.endTime - Date.now()
    io.emit("updateElementStates", elementStates)
}

const startCount = () => {
    if (elementStates.isRunning) return
    elementStates.isRunning = true
    elementStates.endTime = Date.now() + elementStates.remainingTime
    io.emit("updateElementStates", elementStates)
}

const resetCount = () => {
    elementStates.isRunning = false
    elementStates.remainingTime = duration
    elementStates.endTime = Date.now() + elementStates.remainingTime
    io.emit("updateElementStates", elementStates)
}

io.on("connection", (socket) => {
    socket.on("getElementStates", () => {
        socket.emit("updateElementStates", elementStates)
    })

    socket.on("join", (pseudo) => {
        socket.userData = { id: socket.id, pseudo }
        connectedUsers[socket.id] = socket.userData
        console.log("User joined:", connectedUsers[socket.id])
        io.emit("connectedPlayers", Object.values(connectedUsers))
        socket.emit("updateElementStates", elementStates)
    })

    socket.on("start", ({ startTeam }) => {
        if (!elementStates.currentCategory) {
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
        selectedQuestions = questionSelectorGame(questions, elementStates.currentCategory, firstQuestion)
        // elementStates.selectedQuestions = selectedQuestions // on garde les 12
        elementStates.currentQuestion = selectedQuestions[questionIndex]
        io.emit("updateElementStates", elementStates)
        io.emit("playSound", { trackName: "affrontement" })
        firstQuestion = 0
    })

    socket.on("draw", () => {
        if (!elementStates.currentCategory) {
            socket.emit("displayError", {
                error: "Veuillez choisir une catégorie",
            })
            return
        }

        selectedQuestions = questionSelectorGame(questions, elementStates.currentCategory, 10)
        elementStates.currentQuestion = selectedQuestions[questionIndex] // TODO: pas la 11ème à tous les coups ?
        io.emit("updateElementStates", elementStates)
    })

    socket.on("pause", () => {
        pauseCount()
    })

    socket.on("resetTime", () => {
        activeTeam = null
        io.emit("teamUpdate", { activeTeam })
        questionIndex = 0
        selectedQuestions = []
        elementStates.currentQuestion = ""
        io.emit("soundOff")
        resetCount() // emit("updateElementStates", elementStates)
    })

    socket.on("resetScore", () => {
        elementStates.scoreA = 0
        elementStates.scoreB = 0
        io.emit("updateElementStates", elementStates)
    })

    socket.on("category", ({ newCategory }) => {
        elementStates.currentCategory = newCategory
        selectedQuestions = questionSelectorCategory(questions, newCategory)
        elementStates.selectedQuestions = selectedQuestions
        io.emit("updateElementStates", elementStates)
    })

    socket.on("displayCategory", ({ categoryToToggle }) => {
        const category = elementStates.questionListCategories.find((cat) => cat.code === categoryToToggle)
        if (category) {
            category.isAvailable = !category.isAvailable // Bascule true/false
            io.emit("updateElementStates", elementStates)
        }
    })

    socket.on("decision", ({ decision }) => {
        if (decision == "wrong" && elementStates.isRunning) {
            io.emit("playSound", { trackName: "wrong" })
            io.emit("pauseSound", { trackName: "affrontement" })
            pauseCount()
        } else if (decision == "wrong" && !elementStates.isRunning) {
            io.emit("resumeSound", { trackName: "affrontement" })
            startCount()
            questionIndex++
        }

        if (questionIndex < 5 + 1) {
            if (decision == "right") {
                if (activeTeam == "A") elementStates.scoreA += 1
                if (activeTeam == "B") elementStates.scoreB += 1
                io.emit("playSound", { trackName: "right" })
                startCount()
                questionIndex++
            }
            if (decision == "steal") {
                if (activeTeam == "A") elementStates.scoreB += 2 // 2 points pour voler
                if (activeTeam == "B") elementStates.scoreA += 2
                io.emit("playSound", { trackName: "right" })
                io.emit("resumeSound", { trackName: "affrontement" })
                startCount()
                questionIndex++
            }
            socket.emit("updateElementStates", elementStates)
        }

        if (questionIndex < 5) {
            elementStates.currentQuestion = selectedQuestions[questionIndex]
            io.emit("updateElementStates", elementStates)
        }

        if (questionIndex == 5) {
            pauseCount()
            elementStates.currentQuestion = ""
            io.emit("updateElementStates", elementStates)
            io.emit("soundOff")
            setTimeout(function () {
                resetCount()
                activeTeam = null
                io.emit("teamUpdate", { activeTeam })
                questionIndex = 0
                selectedQuestions = []
                elementStates.currentQuestion = ""
                io.emit("updateElementStates", elementStates)
            }, 10000)
        }
    })

    // Display rounds

    socket.on("round", ({ newRound }) => {
        elementStates.round = newRound
        io.emit("updateElementStates", elementStates)
    })

    socket.on("changeElementVisibility", ({ elementId, isVisible }) => {
        elementStates[elementId] = isVisible
        io.emit("updateElementStates", elementStates)
    })

    // Gestion des questions #########

    socket.on("sendQuestion", (question) => {
        console.log(question)
        elementStates.currentQuestion = question.question
        io.emit("updateElementStates", elementStates)
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

    socket.on("requestQuestion", () => {
        io.emit("receiveQuestion", {
            question: questionSelector(allQuestions, null, 1)[0],
        })
    })

    // Gestion des utilisateurs connectés

    socket.on("getConnectedHosts", () => {
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
        elementStates.activePlayer = ""
        io.emit("updateElementStates", elementStates)
    })

    socket.on("playerBuzzed", ({ pseudo }) => {
        if (!elementStates.buzzerActive) return // pour empêcher les quasi simultanés
        elementStates.buzzerActive = false
        elementStates.activePlayer = pseudo
        io.emit("updateElementStates", elementStates)
    })

    // Gestion des fichiers de questionnaires

    socket.on("changeQuestionFile", ({ fileName }) => {
        console.log(`Chargement du fichier de questions: ${fileName}`)
        loadQuestions(fileName)
            .then((loadedQuestions) => {
                questions = loadedQuestions
                console.log(questions.length + " questions chargées")
                activeTeam = null
                io.emit("teamUpdate", { activeTeam })
                questionIndex = 0
                selectedQuestions = []
                elementStates.questionListName = fileName
                elementStates.currentQuestion = ""
                elementStates.currentCategory = ""
                elementStates.scoreA = 0
                elementStates.scoreB = 0
                io.emit("updateElementStates", elementStates)
            })
            .catch((error) => console.error("Erreur lors du chargement des questions:", error))
    })

    // Gestion du chrono

    socket.on("timerEnded", () => {
        console.log("timer ended")
        setTimeout(function () {
            resetCount()
            io.emit("teamUpdate", { activeTeam: null })
            questionIndex = 0
            selectedQuestions = []
            elementStates.currentQuestion = ""
            io.emit("updateElementStates", elementStates)
        }, 5000)
    })

    // sons

    socket.on("playSound", ({ trackName }) => {
        io.emit("playSound", { trackName })
    })
})

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
        elementStates,
    })
})

app.get("/set", (req, res) => {
    res.render("set", {
        layout: "layouts/main",
        elementStates,
    })
})

app.get("/host", (req, res) => {
    res.render("host", {
        layout: "layouts/main",
    })
})

app.get("/builder", (req, res) => {
    res.render("builder", {
        layout: "layouts/main",
    })
})

server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})

// TODO - Tout reprendre
//
// POUR TESTS JANVIER
// [] Dissocier écran joueur (avec saisie) et écran plateau
// [x] Envoi son sur autres écrans ?
// [x] Éviter les doubles appuis sur la tablette
// [] Vols après le chrono
//      [] Il faut donner le dernière réponse avant le fin des 45 secondes. Si on n'a pas joué toutes les questions, les adversaires les jouent.
// [x] Afficheur de thèmes
// [] UI finale, avec les thèmes qui se retournent
//      [] Finale : écran spécial + système de vote
// [] Afficher règles
// [] Sound design : fin de manche, victoire en finale, points volés (double gling)
//      [] bed pour les affrontements, avec un son de fin
// [] QR code pour url locale ?

//
// [x] Garder l'état de la manche actuelle côté serveur
//      [x] Accueil : auth ou logo
//      [x] Manche 1 : auth ou buzzers
//              [x] UI buzzers
//      [x] Manche 2 : écran spécial
//              [x] 5 thèmes
//              [x] Loader de partie
//              [x] Afficher toutes les questions de la manche
//              [x] Pourquoi le chrono à 00:00 on refresh
//              [x] Garder les points on refresh (actuellement, efface sur celui qui refresh et actualise les autres)
// [x] Revoir les questions des parties ; reprendre des parties à 5 thèmes
// [] Système de mot de passe / kick ban des utilisateurs
// [x] Héberger !!!
// [x] Faire une première manche avec 20 questions sélectionnées
//      [x] Les tester dans questions_v3 / quiz
//      [x] Base de donneés ? Mongoose ? Ou dans Questions ?
// [x] rendre beau côté /real
// [] compter les points : système de réponses attendues tolérant + comptage de points manuel (ajouter / enlever)
// [] beau chrono : https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/

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
