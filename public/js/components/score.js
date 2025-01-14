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

    /*
    if (teamAScoreElement) {
        teamAScoreElement.innerHTML = ""
    }
    if (teamBScoreElement) {
        teamBScoreElement.innerHTML = ""
    }

    for (let i = 0; i < scoreA; i++) {
        const point = document.createElement("div")
        point.classList.add("point", "rounded-circle", "bg-success", "m-1")
        point.style.height = "20px"
        point.style.width = "20px"
        document.querySelector("#teamA .score").appendChild(point)
    }
    for (let i = 0; i < scoreB; i++) {
        const point = document.createElement("div")
        point.classList.add("point", "rounded-circle", "bg-success", "m-1")
        point.style.height = "20px"
        point.style.width = "20px"
        document.querySelector("#teamB .score").appendChild(point)
    }
    */
}

export { buildScoreBoard, updateScores }
