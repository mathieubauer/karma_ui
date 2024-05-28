function buildQuestionContainer () {

    const questionContainer = document.createElement('div')
    questionContainer.id = 'question-container'
    questionContainer.className = 'mt-5 px-5 border rounded-pill d-flex align-items-center justify-content-center'
    questionContainer.style.minHeight = '150px'

    const questionText = document.createElement('div')
    questionText.id = 'question'
    questionText.className = 'fw-bold fs-3'
    // questionText.style.minHeight = '100px'

    questionContainer.appendChild(questionText)
    page.appendChild(questionContainer)

}

export { buildQuestionContainer }