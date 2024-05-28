import { buildScoreBoard, updateScores } from './components/score.js'
import { buildCountdown, startCountdown, pauseCountdown } from './components/countdown.js'
import { buildQuestionContainer } from './components/question.js'

const socket = io()

socket.on('chronoUpdate', ({ endTime, isRunning }) => {
    if (isRunning) {
        startCountdown(endTime)
    } else {
        pauseCountdown(endTime)
    }
})

socket.on('questionUpdate', ({ question }) => {
    if (question) {
        document.querySelector('#question').innerHTML = question.question
    } else {
        document.querySelector('#question').innerHTML = ''
    }
})

socket.on('scoreUpdate', ({ scores }) => {
    updateScores(scores)
})


// ONLOAD

buildCountdown()
buildScoreBoard()
buildQuestionContainer()