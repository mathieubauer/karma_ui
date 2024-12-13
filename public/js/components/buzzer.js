import socket from "./socket.js"
import ElementBuilder from "./ElementBuilder.js"

function buildBuzzer(elementStates) {
    const buzzerButton = new ElementBuilder("div") //
        .setId("buzzerButton")
        .setAttribute("role", "button")
        .setAttribute("tabindex", "0")
        .setAttribute("data-disabled", !elementStates.buzzerActive)
        .addEvent("mousedown", () => {
            setTimeout(() => {
                const pseudo = localStorage.getItem("pseudo") || "Anonymous"
                socket.emit("playerBuzzed", { pseudo })
                buzzerButton.setAttribute("data-disabled", true)
            }, 200)
        })
        .addEvent("touchstart", () => {
            setTimeout(() => {
                const pseudo = localStorage.getItem("pseudo") || "Anonymous"
                socket.emit("playerBuzzed", { pseudo })
                buzzerButton.setAttribute("data-disabled", true)
            }, 200)
        })
        .build()

    const savedPseudo = localStorage.getItem("pseudo")
    if (elementStates.activePlayer == savedPseudo && savedPseudo) {
        buzzerButton.classList.add("first")
    }

    const base = new ElementBuilder("div") //
        .setId("base")
        .addChild(buzzerButton)
        .build()

    const buzzerMount = new ElementBuilder("div") //
        .setId("buzzerMount")
        .addChild(base)
        .build()

    const buzzerContainer = new ElementBuilder("div") //
        .setId("fullPageContainer")
        .addChild(buzzerMount)
        .build()

    return buzzerContainer
}

export { buildBuzzer }
