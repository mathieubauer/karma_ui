import socket from "./socket.js"
import ElementBuilder from "./ElementBuilder.js"

let countdownInterval

function buildCountdown(time) {
    const { minutes, seconds, centiseconds } = formatTime(time)

    const secondsSpan = new ElementBuilder("span") //
        .addClass("seconds")
        .setText(`${minutes}:${seconds}`)
        .build()

    const centisecondsSpan = new ElementBuilder("span") //
        .addClass("centiseconds")
        .setText(`.${centiseconds}`)
        .build()

    const countdownContainer = new ElementBuilder("div")
        .setId("countdownContainer")
        .addChild(secondsSpan)
        .addChild(centisecondsSpan)
        .build()

    return countdownContainer
}

function updateCountdown(time) {
    const { minutes, seconds, centiseconds } = formatTime(time)

    const secondsElement = document.querySelector(".seconds")
    const centisecondsElement = document.querySelector(".centiseconds")

    if (secondsElement) {
        secondsElement.textContent = `${minutes}:${seconds}`
    }
    if (centisecondsElement) {
        centisecondsElement.textContent = `.${centiseconds}`
    }
}

function startCountdown(endTime) {
    if (countdownInterval) clearInterval(countdownInterval) // s'assurer qu'un seul interval est actif

    countdownInterval = setInterval(() => {
        const now = Date.now()
        let remainingTime = endTime - now

        if (remainingTime <= 0) {
            clearInterval(countdownInterval)
            remainingTime = 0
            socket.emit("timerEnded")
        }

        updateCountdown(remainingTime)
    }, 40)
}

function pauseCountdown(remainingTime) {
    if (countdownInterval) clearInterval(countdownInterval) // s'assurer qu'un seul interval est actif
    // let remainingTime = Math.max(endTime - Date.now(), 0)
    // if (remainingTime > 44500) remainingTime = 45000 // hack pour compte rond au reset (préférer 44900, selon le wifi)
    updateCountdown(remainingTime)
}

function formatTime(time) {
    const minutes = Math.floor(time / 60000)
        .toString()
        .padStart(2, "0")
    const seconds = Math.floor((time % 60000) / 1000)
        .toString()
        .padStart(2, "0")
    const centiseconds = Math.floor((time % 1000) / 10)
        .toString()
        .padStart(2, "0")
    return { minutes, seconds, centiseconds }
}

export { buildCountdown, updateCountdown, startCountdown, pauseCountdown }
