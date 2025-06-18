//Node server which will handle the socket connection
const io = require('socket.io')(8000, {
    cors: {
        origin: "*",
    }
});
const users = {};
const typingUsers = new Set();

io.on('connection', (socket) => {
    socket.on('new-user-joined', name => {
        console.log(`New user joined: ${name}`);
        users[socket.id] = name;                     // When a new user joins, store their name and socket ID
        socket.broadcast.emit('user-joined', name);  // Broadcast to all clients that a new user has joined
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });   // Broadcast the message to all clients
    });

    socket.on('disconnect', () => {
        typingUsers.delete(socket.id);
        io.emit('typing-users', Array.from(typingUsers).map(id => users[id]).filter(Boolean));

        socket.broadcast.emit('leave', users[socket.id]);    // Broadcast the message to all clients
        delete users[socket.id];
    });

    socket.on('typing', () => {
        typingUsers.add(socket.id);
        io.emit('typing-users', Array.from(typingUsers).map(id => users[id]).filter(Boolean));
    });

    socket.on('stopTyping', () => {
        typingUsers.delete(socket.id);
        io.emit('typing-users', Array.from(typingUsers).map(id => users[id]).filter(Boolean));
    });
});