const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	msgText: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Chat", ChatSchema);
