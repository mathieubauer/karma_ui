function buildScoreBoard() {
    // page ?

    // Créez l'élément <hr>
    const hr = document.createElement("hr")

    // Créez le conteneur principal <div>
    const scoreContainer = document.createElement("div")
    scoreContainer.id = "score-container"
    scoreContainer.className = "text-center d-flex"

    const names = ["A", "B"]

    for (let i = 0; i < names.length; i++) {
        const teamDiv = document.createElement("div")
        teamDiv.id = `team${names[i]}`
        teamDiv.className = "fw-bold fs-3 col-6"

        const nameDiv = document.createElement("div")
        nameDiv.textContent = `Équipe ${names[i]}`
        teamDiv.appendChild(nameDiv)

        const scoreDiv = document.createElement("div")
        scoreDiv.className = "score d-flex justify-content-center"
        scoreDiv.style.minHeight = "28px"
        teamDiv.appendChild(scoreDiv)

        scoreContainer.appendChild(teamDiv)
    }

    const mainContainer = document.querySelector("#scoreContainer")
    if (mainContainer) {
        mainContainer.appendChild(scoreContainer)
    } else {
        page.appendChild(scoreContainer)
    }
}

function updateScores(scores) {
    const teamAScoreElement = document.querySelector("#teamA .score")
    const teamBScoreElement = document.querySelector("#teamB .score")

    if (teamAScoreElement) {
        teamAScoreElement.innerHTML = ""
    }
    if (teamBScoreElement) {
        teamBScoreElement.innerHTML = ""
    }

    for (let i = 0; i < scores.teamA; i++) {
        const point = document.createElement("div")
        point.classList.add("point", "rounded-circle", "bg-success", "m-1")
        point.style.height = "20px"
        point.style.width = "20px"
        document.querySelector("#teamA .score").appendChild(point)
    }
    for (let i = 0; i < scores.teamB; i++) {
        const point = document.createElement("div")
        point.classList.add("point", "rounded-circle", "bg-success", "m-1")
        point.style.height = "20px"
        point.style.width = "20px"
        document.querySelector("#teamB .score").appendChild(point)
    }

    // Fonction pour mettre à jour les scores, équivalent de la partie socket.on('scoreUpdate', ...) précédente
    // document.querySelector('#teamA .score').textContent = `Score: ${ scores.teamA }`
    // document.querySelector('#teamB .score').textContent = `Score: ${ scores.teamB }`
}

export { buildScoreBoard, updateScores }
