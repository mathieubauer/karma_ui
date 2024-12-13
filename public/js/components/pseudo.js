import socket from "./socket.js"
import { showToast } from "./toast.js"
import ElementBuilder from "./ElementBuilder.js"

function buildPseudoInput() {
    const pseudoContainer = new ElementBuilder("form")
        .addClass("pseudo-container d-flex align-items-center justify-content-center")
        .addEvent("submit", (e) => {
            e.preventDefault()
            const pseudo = pseudoInput.value.trim()
            if (pseudo) {
                localStorage.setItem("pseudo", pseudo)
                socket.emit("join", pseudo)
                showToast("Enregistré !", "success")
                pseudoContainer.remove() // Retire le formulaire
            }
        })
        .build()

    const pseudoInput = new ElementBuilder("input")
        .setAttribute("type", "text")
        .setId("pseudoInput")
        .addClass("form-control")
        .setAttribute("placeholder", "Votre nom")
        .build()

    const savedPseudo = localStorage.getItem("pseudo")
    if (savedPseudo) {
        pseudoInput.value = savedPseudo
    }

    const submitButton = new ElementBuilder("button") //
        .setId("joinBtn")
        .addClass("btn btn-primary ms-2")
        .setText("Rejoindre")
        .build()

    pseudoContainer.appendChild(pseudoInput)
    pseudoContainer.appendChild(submitButton)

    const fullPageContainer = new ElementBuilder("div") //
        .setId("fullPageContainer")
        .addChild(pseudoContainer)
        .build()

    return fullPageContainer
}

export { buildPseudoInput }
