const express = require("express");
const Chat = require("../models/Chat");
const router = express.Router();
const verifyToken = require("./verifyToken");

router.post("/", verifyToken, async (req, res) => {
	// Create new message
	const chat = new Chat({
		username: req.body.username,
		msgText: req.body.msgText,
	});
	try {
		const savedChat = await chat.save();
		res.send(savedChat);
	} catch (err) {
		res.status(400).send({ message: err });
	}
});

router.get("/", verifyToken, async (req, res) => {
	// get all the messages
	try {
		const messages = await Chat.find();
		res.send(messages);
	} catch (err) {
		res.send({ message: err });
	}
});

module.exports = router;
