import socket from "./socket.js"
import { showToast } from "./toast.js"

function buildQuestionContainer() {
    const questionContainer = document.createElement("div")
    questionContainer.id = "question-container"
    questionContainer.className =
        "mt-5 px-5 border rounded-pill d-flex align-items-center justify-content-center"
    questionContainer.style.minHeight = "200px"

    const questionText = document.createElement("div")
    questionText.id = "question"
    questionText.className = "fw-bold fs-1"
    // questionText.style.minHeight = '100px'

    questionContainer.appendChild(questionText)
    page.appendChild(questionContainer)
}

function buildOpenQuestionContainer() {
    const questionContainer = document.createElement("div")
    questionContainer.id = "question"
    questionContainer.className =
        "mt-5 px-5 border d-flex align-items-center justify-content-center"
    questionContainer.style.minHeight = "200px"

    const form = document.createElement("form")
    form.className = "text-center mt-3"
    form.addEventListener("submit", (event) => {
        event.preventDefault()
        const answer = answerInput.value
        socket.emit("sendAnswer", { answer })
        answerInput.value = ""
        showToast(`Réponse enregistrée : <strong> ${answer} </strong>`, "success")
    })

    const answerInput = document.createElement("input")
    answerInput.type = "text"
    answerInput.id = "answerInput"
    answerInput.className = "form-control mt-3 text-center"
    answerInput.placeholder = "Votre réponse"

    const submitAnswerBtn = document.createElement("button")
    submitAnswerBtn.type = "submit"
    submitAnswerBtn.id = "answerBtn"
    submitAnswerBtn.className = "btn btn-primary mt-3"
    submitAnswerBtn.textContent = "Envoyer la réponse"

    form.appendChild(answerInput)
    form.appendChild(submitAnswerBtn)

    page.appendChild(questionContainer)
    page.appendChild(form)
}

export { buildQuestionContainer, buildOpenQuestionContainer }
