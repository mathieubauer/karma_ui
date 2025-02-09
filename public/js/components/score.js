import ElementBuilder from "./ElementBuilder.js"

function buildScoreBoard() {
    const scoreContainer = new ElementBuilder("div") //
        .setId("scoreContainer")
        .addClass("text-center d-flex")
        .build()

    const names = ["A", "B"]

    for (let i = 0; i < names.length; i++) {
        const teamDiv = new ElementBuilder("div") //
            .setId(`team${names[i]}`)
            .addClass("teamArea mx-3 d-flex")
            .build()

        const nameDiv = new ElementBuilder("div") //
            .addClass("teamName text-secondary")
            .setText(`${names[i]}`)
            .build()

        const scoreDiv = new ElementBuilder("div") //
            .addClass("teamScore fw-bold ms-1")
            .build()

        teamDiv.appendChild(nameDiv)
        teamDiv.appendChild(scoreDiv)

        scoreContainer.appendChild(teamDiv)
    }

    return scoreContainer
}

function updateScores(scoreA, scoreB) {
    const teamAScoreElement = document.querySelector("#teamA .teamScore")
    const teamBScoreElement = document.querySelector("#teamB .teamScore")

    if (teamAScoreElement) {
        teamAScoreElement.innerHTML = scoreA
    }
    if (teamBScoreElement) {
        teamBScoreElement.innerHTML = scoreB
    }
}

export { buildScoreBoard, updateScores }
