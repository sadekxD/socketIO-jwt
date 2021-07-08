const express = require("express");
const dotenv = require("dotenv");
const app = express();
const http = require("http").createServer(app);
const mongoose = require("mongoose");
const cors = require("cors");
const io = require("socket.io")(http, {
	cors: {
		origin: "*",
	},
});
dotenv.config();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// ROUTES
const auth = require("./routes/auth");
const chat = require("./routes/chat");
const users = require("./routes/users");

// MODEL
const Chat = require("./models/Chat");

// AUTHENTICATION ROUTES
app.use("/api/auth", auth);

// CHAT ROUTES
app.use("/api/chat", chat);

// USER ROUTE
app.use("/api/users", users);

// DATABASE CONNECT
mongoose.connect(
	process.env.DB_CONNECTION,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	() => console.log("connected to database")
);

io.on("connection", (socket) => {
	console.log("a user connected");
	socket.on("message", async (data) => {
		io.emit("new-message", data);
		const message = await new Chat({
			username: data.username,
			msgText: data.msgText,
		});

		message.save();
	});
});

// PORT
const PORT = process.env.PORT || 8000;

http.listen(PORT, () => {
	console.log(`listening to port ${PORT}`);
});
