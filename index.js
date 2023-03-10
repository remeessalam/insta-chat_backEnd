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

moongose.connect(process.env.MONGOURL)
    .then(() => {
        console.log('database connected')
    })
    .catch((err) => {
        console.log(err);
    })
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use('/', user)
app.use('/post', post)
app.use('/chat', chat)
app.use('/notification', notification)

app.use(errorHandler)

const PORT = process.env.PORT || 8000
server.listen(PORT, () =>
    console.log(` app listening on port ${PORT}!`),
);

