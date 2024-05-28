const categoryMap = {
    pop: 'Pop culture, loisirs et sports',
    vie: 'Vie quotidienne',
    mon: 'Connaissance du monde',
    aca: 'Savoirs académiques'
}

const questionSelector = (questions, category = null, count = 5) => {

    if (category) {
        const longCategory = categoryMap[ category ]
        questions = questions.filter(question => question.category == longCategory)
    }

    let selectedQuestions = []
    const seenIndexes = new Set()

    while (selectedQuestions.length < count && seenIndexes.size < questions.length) {
        const randomIndex = Math.floor(Math.random() * questions.length)
        if (!seenIndexes.has(randomIndex)) {
            selectedQuestions.push(questions[ randomIndex ])
            seenIndexes.add(randomIndex)
        }
    }

    return selectedQuestions

}

const questionSelectorGame = (questions, category, firstQuestion) => {

    if (category) {
        const longCategory = categoryMap[ category ]
        questions = questions.filter(question => question.category == longCategory)
    }

    let selectedQuestions = []
    for (let index = firstQuestion; index < firstQuestion + 5; index++) {
        selectedQuestions.push(questions[index])
    }

    console.log(selectedQuestions.length);
    console.log(selectedQuestions);

    return selectedQuestions

}

module.exports = {
    questionSelector,
    questionSelectorGame
}