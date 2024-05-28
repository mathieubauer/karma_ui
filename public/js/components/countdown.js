let countdownInterval

function buildCountdown () {

    const displayContainer = document.createElement('div')
    displayContainer.id = 'display'
    displayContainer.className = 'font-monospace mb-5'

    const secondsSpan = document.createElement('span')
    secondsSpan.className = 'seconds display-1'
    secondsSpan.textContent = '00:00'

    const centisecondsSpan = document.createElement('span')
    centisecondsSpan.className = 'centiseconds display-5'
    centisecondsSpan.textContent = ':00'

    displayContainer.appendChild(secondsSpan)
    displayContainer.appendChild(centisecondsSpan)

    page.appendChild(displayContainer) 
}

function updateCountdown (time) {

    const minutes = Math.floor(time / 60000).toString().padStart(2, '0')
    const seconds = Math.floor((time % 60000) / 1000).toString().padStart(2, '0')
    const milliseconds = (time % 1000).toString().padStart(3, '0')

    document.querySelector('.seconds').textContent = `${ minutes }:${ seconds }`
    document.querySelector('.centiseconds').textContent = `.${ milliseconds.slice(0, 2) }` // Affiche que les 2 premiers chiffres pour les centièmes
}

function startCountdown (endTime) {
    // S'assurer qu'il n'y a pas d'autre intervalle en cours d'exécution
    clearInterval(countdownInterval)

    countdownInterval = setInterval(() => {
        const now = Date.now()
        let remainingTime = endTime - now
        if (remainingTime < 0) {
            clearInterval(countdownInterval)
            remainingTime = 0
        }
        updateCountdown(remainingTime)
    }, 10)
}

function pauseCountdown (endTime) {
    clearInterval(countdownInterval)
    let remainingTime = Math.max(endTime - Date.now(), 0)
    if (remainingTime > 44500) remainingTime = 45000 // hack pour compte rond au reset (préférer 44900, selon le wifi)
    updateCountdown(remainingTime)
}

export { buildCountdown, updateCountdown, startCountdown, pauseCountdown }