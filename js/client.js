const socket = io('http://localhost:8000', {
    transports: ['websocket']
}); 

const form = document.getElementById('send-container'); // Get the form element
const messageInput = document.getElementById('messageInp'); // Get the input field for messages
const messageContainer = document.querySelector('.container'); // Get the container to display messages
var audio = new Audio('notification.wav'); 

const typingDisplay = document.createElement('div');
typingDisplay.classList.add('typing');
document.querySelector('.container').appendChild(typingDisplay);
let typingTimeout;

const append = (message,position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position === 'left') {
        audio.play();                   // Play notification sound when a message is received
    }
}

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`,'right');
    messageInput.value = '';
    socket.emit('send', message);
})

messageInput.addEventListener('input', () => {
    socket.emit('typing');

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping');
    }, 1500);
});

const name2 = prompt('Enter your name to join'); // Prompt the user for their name
socket.emit('new-user-joined', name2);

socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right'); // Append a message when a new user joins
});

socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

socket.on('leave', name => {
    append(`${name} left the chat`, 'right');
});

socket.on('typing-users', (usernames) => {
    // Remove self from typing list
    const filtered = usernames.filter(u => u !== name2);

    if (filtered.length === 0) {
        typingDisplay.innerText = '';
    } else if (filtered.length === 1) {
        typingDisplay.innerText = `${filtered[0]} is typing...`;
    } else {
        typingDisplay.innerText = `${filtered.join(' and ')} are typing...`;
    }
});