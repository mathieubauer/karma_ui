const socket = io()

document.querySelector('#theButton').addEventListener('click', () => {
    socket.emit('action', {
        message: 'hello',
        id: socket.id
    }, (error) => {
        if (error) return console.log(error)
    })
})

socket.on('feedback', ({ message }) => {
    console.log(message)
})