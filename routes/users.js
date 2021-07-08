const express = require("express");
const jwt = require("jsonwebtoken");
const route = express.Router();
const verifyToken = require("./verifyToken");

// Models
const User = require("../models/User");

// Get User
route.get("/me", verifyToken, async (req, res) => {
	const user = await User.findOne({ _id: req.user._id });
	res.send({ _id: user.id, username: user.username });
});

module.exports = route;
