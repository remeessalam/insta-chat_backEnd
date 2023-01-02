const http = require("http");
const express = require('express');
const app = express();
const cors = require('cors');
const user = require('./routes/user');
const post = require('./routes/post');
const chat = require('./routes/chat');
const notification = require('./routes/notification')
const server = http.createServer(app);
const moongose = require('mongoose');
const { errorHandler } = require('./middleware/handlerror')
app.use(express.json());

moongose.connect('mongodb://localhost:27017/instachat')
    .then(() => {
        console.log('database connected')
    })
    .catch((err) => {
        (console.err.message)
    })
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use('/', user)
app.use('/post', post)
app.use('/chat', chat)
app.use('/notification', notification)

app.use(errorHandler)

const PORT = process.env.PORT || 2000
server.listen(PORT, () =>
    console.log(` app listening on port ${PORT}!`),
);

