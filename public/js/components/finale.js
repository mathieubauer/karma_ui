import ElementBuilder from "./ElementBuilder.js"

function buildFinaleScoreBoard() {
    const scoreContainer = new ElementBuilder("div")
        .setId("scoreFinaleContainer") //
        .addClass("d-flex justify-content-center w-100")
        .build()

    for (let i = 0; i < 5; i++) {
        const circle = new ElementBuilder("div")
            .addClass("finaleCircle rounded-circle border border-white border-2 mx-2")
            .setAttribute("style", "width: 50px; height: 50px;")
            .setAttribute("data-questionIndex", i)
            .build()
        scoreContainer.appendChild(circle)
    }

    return scoreContainer
}

function updateFinaleScores(scoreFinale) {
    // cinq chaines de char dans un tableau

    for (let i = 0; i < 5; i++) {
        const circle = document.querySelector(`.finaleCircle[data-questionIndex="${i}"]`)
        circle.classList.remove("bg-success")
        circle.classList.remove("bg-warning")
        circle.classList.remove("bg-danger")
        circle.classList.add(`bg-${scoreFinale[i]}`)
    }
}

export { buildFinaleScoreBoard, updateFinaleScores }
