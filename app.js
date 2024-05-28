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

/**
 * Met tout le fichier dans questions
 */
loadQuestions('karma_game_004.csv')
// loadQuestions('karma_lpgqdf.csv')
    .then(loadedQuestions => {
        questions = loadedQuestions
        questionsLoaded = true
        console.log(questions.length + ' questions chargées')
        // console.log(questions)
        // console.log(questions[3]) 
    })
    .catch(error => console.error('Erreur lors du chargement des questions:', error))

loadQuestions('karma_lpgqdf.csv')
    .then(loadedQuestions => {
        allQuestions = loadedQuestions
        // questionsLoaded = true 
        console.log(allQuestions.length + ' questions chargées')
    })
    .catch(error => console.error('Erreur lors du chargement des questions:', error))



const pauseCount = () => {
    if (!isRunning) return
    isRunning = false
    remainingTime = endTime - Date.now() // 
    io.emit('chronoUpdate', { endTime, isRunning })
}

const startCount = () => {
    if (isRunning) return
    isRunning = true
    endTime = Date.now() + remainingTime
    io.emit('chronoUpdate', { endTime, isRunning })
}


io.on('connection', (socket) => {

    console.log("New WebSocket connection - Un utilisateur s'est connecté")
    if (!isRunning) {
        endTime = Date.now() + remainingTime
    }
    // endTime = Date.now() + remainingTime
    io.emit('chronoUpdate', { endTime, isRunning })
    io.emit('scoreUpdate', { scores })
    io.emit('questionUpdate', { question: selectedQuestions[ questionIndex ] }) // on reload
    io.emit('displayCategory', { category })
    io.emit('teamUpdate', { activeTeam })

    socket.on('start', ({ startTeam }) => {

        if (!category) {
            socket.emit('displayError', { error: "Veuillez choisir une catégorie" })
            return
        }

        startCount()

        if (startTeam == 'startA') activeTeam = 'A'
        if (startTeam == 'startB') activeTeam = 'B'
        io.emit('teamUpdate', { activeTeam })

        // selectedQuestions = questionSelector(questions, category)
        // console.log(selectedQuestions);
        // io.emit('questionUpdate', { question: selectedQuestions[ questionIndex ] })

        // TODO: select first question
        // team1 +0, teamB +5 ; categ, + 0, 10, 20, 30mù:à=pù

        let firstQuestion = 0
        // if (category == 'vie') firstQuestion = + 11 
        // if (category == 'acc') firstQuestion = + 22
        // if (category == 'mon') firstQuestion = + 33 
        if (activeTeam == 'B') firstQuestion = + 5

        selectedQuestions = questionSelectorGame(questions, category, firstQuestion)
        io.emit('questionUpdate', { question: selectedQuestions[ questionIndex ] })

        firstQuestion = 0

    })

    socket.on('draw', () => {

        if (!category) {
            socket.emit('displayError', { error: "Veuillez choisir une catégorie" })
            return
        }

        selectedQuestions = questionSelectorGame(questions, category, 10)
        io.emit('questionUpdate', { question: selectedQuestions[ questionIndex ] })

    })

    socket.on('requestQuestion', () => {
        io.emit('receiveQuestion', { question: questionSelector(allQuestions, null, 1)[0] })
    })

    socket.on('pause', () => {
        pauseCount()
    })

    socket.on('reset', () => {
        isRunning = false
        remainingTime = duration
        endTime = Date.now() + remainingTime
        io.emit('chronoUpdate', { endTime, isRunning })
        io.emit('teamUpdate', { activeTeam: null })
        questionIndex = 0
        // vider le questionnaire
        io.emit('questionUpdate', { question: null })
    })

    socket.on('resetScore', () => {
        scores.teamA = 0
        scores.teamB = 0
        io.emit('scoreUpdate', { scores })
    })

    socket.on('category', ({ newCategory }) => {
        category = newCategory
        io.emit('displayCategory', { category })
    })

    socket.on('decision', ({ decision }) => {

        if (decision == 'wrong' && isRunning) {
            pauseCount()
        } else if (decision == 'wrong' && !isRunning) {
            startCount()
            questionIndex++
        }

        if (questionIndex < 5 + 1) {
            if (decision == 'right') {
                if (activeTeam == 'A') scores.teamA += 1
                if (activeTeam == 'B') scores.teamB += 1
                startCount()
                questionIndex++
            }
            if (decision == 'steal') {
                if (activeTeam == 'A') scores.teamB += 1
                if (activeTeam == 'B') scores.teamA += 1
                startCount()
                questionIndex++
            }
            io.emit('scoreUpdate', { scores })
        }

        if (questionIndex < 5) {
            io.emit('questionUpdate', { question: selectedQuestions[ questionIndex ] })
        }

        if (questionIndex == 5) {
            pauseCount()
            io.emit('questionUpdate', { question: null })
        }

    })

})

app.get('', (req, res) => {
    res.render('index', {
        layout: 'layouts/main',
        demo: "hello world : /host & /player",
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

app.get('/player', (req, res) => {
    res.render('player', {
        layout: 'layouts/main',
    })
})

server.listen(port, () => {
    console.log(`server is up on port ${ port }`)
})

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
// [] sons
// [x] vérifier tous les états au refresh (chrono, question active, catégorie active, équipe active, scores)
// [x] reset scores 
// [] ajouter les ID de questions ?
// [] néon ui : https://css-tricks.com/how-to-create-neon-text-with-css/
// [] créer un préparateur de questionnaires (donner 15 questions à équilibrer en deux séries de 5 et une éliminatoire, permettre la modification)
// [x] UI host, centré dans l'écran, couleurs KARMA

// pour second device : http://192.168.169.186:3000/player (si connecté sur le même WiFi)

// projet UI Karma

//     - affichage questions et chrono
//         - Affichage animateur: réponse attendue + boutons de validation
//             - base de donnée des questions, par thème(peut - on mettre toutes les questions dans les catégories / sous - catégories ?)