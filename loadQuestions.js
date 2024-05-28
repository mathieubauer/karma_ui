const fs = require('fs')
const csv = require('csv-parser')

function loadQuestions (filePath) {
    return new Promise((resolve, reject) => {
        const questions = []
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => questions.push(data))
            .on('end', () => resolve(questions))
            .on('error', (error) => reject(error))
    })
}

module.exports = loadQuestions
