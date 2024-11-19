import socket from "./socket.js"
import { showToast } from "./toast.js"

function checkUsername() {
    const savedPseudo = localStorage.getItem("pseudo")
    if (savedPseudo) {
        socket.emit("join", savedPseudo)
    } else {
        buildPseudoInput()
    }
}

function buildPseudoInput() {
    const page = document.getElementById("page")
    if (!page) return console.error("Page element not found")

    const container = document.createElement("div")
    container.className = "pseudo-container d-flex align-items-center"

    const pseudoInput = document.createElement("input")
    pseudoInput.type = "text"
    pseudoInput.id = "pseudoInput"
    pseudoInput.className = "form-control"
    pseudoInput.placeholder = "Votre nom"

    const submitButton = document.createElement("button")
    submitButton.id = "joinBtn"
    submitButton.className = "btn btn-primary ms-2"
    submitButton.textContent = "Rejoindre"

    submitButton.addEventListener("click", () => {
        const pseudo = pseudoInput.value.trim()
        if (pseudo) {
            localStorage.setItem("pseudo", pseudo)
            socket.emit("join", pseudo)
            showToast("Nom enregistré !", "success")
            container.remove()
        }
    })

    container.appendChild(pseudoInput)
    container.appendChild(submitButton)

    page.appendChild(container)

    const savedPseudo = localStorage.getItem("pseudo")
    if (savedPseudo) {
        pseudoInput.value = savedPseudo
        socket.emit("join", savedPseudo)
    }
}

export { checkUsername, buildPseudoInput }
