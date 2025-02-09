import socket from "./socket.js"
import ElementBuilder from "./ElementBuilder.js"

const colorsWithAlpha = [
    "rgba(237, 217, 47, 0.5)", // #EDD92F
    "rgba(0, 39, 82, 0.5)", // #002752
    "rgba(255, 138, 216, 0.5)", // #FF8AD8
    "rgba(78, 167, 46, 0.5)", // #4EA72E
    "rgba(233, 113, 50, 0.5)", // #E97132
]
function buildCategoryBoard(categories) {
    const categoryBoardContainer = new ElementBuilder("div") //
        .setId("categoryBoardContainer")
        .addClass("w-100 h-100 d-flex align-content-center align-items-center justify-content-center flex-wrap p-5")
        .build()

    categories.forEach((category, index) => {
        const div = new ElementBuilder("div")
            .addClass("displayCategory btn m-2 p-2 text-uppercase fw-bold d-flex align-items-center justify-content-center text-white")
            .addClass(`${category.isAvailable ? "opacity-100" : "opacity-25"}`)
            .setAttribute("style", `width: 15vw; height: 15vw; background: ${colorsWithAlpha[index]}`)
            .setText(`${category.name}`)
            .build()
        categoryBoardContainer.appendChild(div)
    })

    return categoryBoardContainer
}

export { buildCategoryBoard }
