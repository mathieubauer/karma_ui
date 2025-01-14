const categoryMap = require("./public/js/components/categoryMap.js")

const questionSelector = (questions, category = null, count = 5) => {
    if (category) {
        const longCategory = categoryMap[category]
        questions = questions.filter((question) => question.category == longCategory)
    }

    let selectedQuestions = []
    const seenIndexes = new Set()

    while (selectedQuestions.length < count && seenIndexes.size < questions.length) {
        const randomIndex = Math.floor(Math.random() * questions.length)
        if (!seenIndexes.has(randomIndex)) {
            selectedQuestions.push(questions[randomIndex])
            seenIndexes.add(randomIndex)
        }
    }

    return selectedQuestions
}

const questionSelectorGame = (questions, categoryCode, firstQuestion) => {
    if (categoryCode) {
        const longCategory = categoryMap[categoryCode]
        questions = questions.filter((question) => question.category == longCategory)
    }

    let selectedQuestions = []
    for (let index = firstQuestion; index < firstQuestion + 5; index++) {
        selectedQuestions.push(questions[index])
    }

    return selectedQuestions
}

const questionSelectorCategory = (questions, categoryCode) => {
    if (categoryCode) {
        const longCategory = categoryMap[categoryCode]
        questions = questions.filter((question) => question.category == longCategory)
    }
    return questions
}

module.exports = {
    questionSelector,
    questionSelectorGame,
    questionSelectorCategory,
}
