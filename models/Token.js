const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
	refreshToken: {
		type: String,
		required: true,
		min: 6,
		max: 512,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Token", TokenSchema);
