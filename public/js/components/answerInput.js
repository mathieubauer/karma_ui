import socket from "./socket.js"
import { showToast } from "./toast.js"
import ElementBuilder from "./ElementBuilder.js"

function buildAnswerInputContainer() {
    const form = new ElementBuilder("form") //
        .addClass("text-center mt-3 w-100 px-5")
        .addEvent("submit", (event) => {
            event.preventDefault()
            const answerInput = document.getElementById("answerInput")
            const answer = answerInput.value.trim()

            if (!answer) return

            // Envoi de la réponse via socket.io avec un timecode
            socket.emit("sendAnswer", { answer, time: Date.now() })

            answerInput.value = ""
            showToast(`Réponse enregistrée : <strong>${answer}</strong>`, "success")
        })

    const answerInput = new ElementBuilder("input")
        .setAttribute("type", "text")
        .setId("answerInput")
        .addClass("form-control mt-3 text-center w-100")
        .setAttribute("placeholder", "Votre réponse")
        .build()

    const submitAnswerBtn = new ElementBuilder("button")
        .setAttribute("type", "submit")
        .setId("answerBtn")
        .addClass("btn btn-primary mt-3")
        .setText("Envoyer la réponse")
        .build()

    form.addChild(answerInput)
    form.addChild(submitAnswerBtn)

    return form.build()
}

export { buildAnswerInputContainer }
