import socket from "./socket.js"
import { showToast } from "./toast.js"

function buildQuestionContainer() {

    const questionCategory = document.createElement("div")
    questionCategory.id = "question-category"
    questionCategory.className = "text-center fs-3 mt-5 fw-bold text-warning"
    questionCategory.style.minHeight = "50px"

    const questionContainer = document.createElement("div")
    questionContainer.id = "question-container"
    questionContainer.className = "px-5 border rounded-5 d-flex align-items-center justify-content-center"
    questionContainer.style.minHeight = "200px"

    const questionText = document.createElement("div")
    questionText.id = "question"
    questionText.className = "fw-bold fs-3z"
    // questionText.style.fontSize = "clamp(24px, 5vw, 40px)"
    questionText.style.cssText = "font-size: clamp(24px, 4vw, 40px);"

    questionContainer.appendChild(questionText)
    page.appendChild(questionCategory)
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
