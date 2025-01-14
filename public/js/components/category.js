import socket from "./socket.js"
import ElementBuilder from "./ElementBuilder.js"

function buildCategoryBoard(categories) {
    const categoryBoardContainer = new ElementBuilder("div") //
        .setId("categoryBoardContainer")
        // .addClass("w-100 h-100 d-flexZ align-items-center justify-content-center")
        .addClass("w-100 h-100 d-flex align-content-center align-items-center justify-content-center flex-wrap p-5")
        .build()

    categories.forEach((category) => {
        const div = new ElementBuilder("div")
            .addClass("displayCategory btn m-2 p-2 text-uppercase fw-bold d-flex align-items-center justify-content-center")
            .addClass(`${category.isAvailable ? "btn-warning" : "btn-outline-secondary"}`)
            .setAttribute("style", "width: 15vw; height: 15vw;")
            // .setAttribute("type", "button")
            .setText(`${category.name}`)
            // .addEvent("click", (event) => {
            //     const categoryToToggle = event.target.dataset.category
            //     socket.emit("displayCategory", { categoryToToggle })
            // })
            .build()
        categoryBoardContainer.appendChild(div)
    })

    // const savedPseudo = localStorage.getItem("pseudo")
    // if (elementStates.activePlayer == savedPseudo && savedPseudo) {
    //     buzzerButton.classList.add("first")
    // }

    // const base = new ElementBuilder("div") //
    //     .setId("base")
    //     .addChild(buzzerButton)
    //     .build()

    // const buzzerMount = new ElementBuilder("div") //
    //     .setId("buzzerMount")
    //     .addChild(base)
    //     .build()

    // const buzzerContainer = new ElementBuilder("div") //
    //     .setId("fullPageContainer")
    //     .addChild(buzzerMount)
    //     .build()

    return categoryBoardContainer
}

export { buildCategoryBoard }
