const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const route = express.Router();

// Valiadators
const { registerValidation, loginValidation } = require("../validator");

// Models
const User = require("../models/User");
const Token = require("../models/Token");

// Register
route.post("/register", async (req, res) => {
	// Lets validate the data before we create a user
	const { error } = registerValidation(req.body);

	if (error) return res.status(400).send({ message: error.details[0].message });

	const emailExist = await User.findOne({ email: req.body.email });

	if (emailExist)
		return res.status(400).send({ message: "email already exists" });

	// Hash Password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	// Create a new User
	const user = new User({
		username: req.body.username,
		email: req.body.email,
		password: hashedPassword,
	});

	try {
		const savedUser = await user.save();
		// Create and assign a token
		const refreshToken = jwt.sign(
			{ _id: savedUser._id },
			process.env.REFRESH_TOKEN_SECRET
		);
		const accessToken = generateAccessToken({ _id: savedUser._id });
		const token = new Token({ refreshToken: refreshToken });
		token.save();
		res.send({ accessToken: accessToken, refreshToken: refreshToken });
	} catch (err) {
		res.status(400).send({ message: err });
	}
});

// Access Token
route.post("/token", async (req, res) => {
	const refreshToken = req.body.token;
	if (!refreshToken) return res.sendStatus(401);
	const tokenExist = await Token.findOne({ refreshToken: refreshToken });
	if (!tokenExist) return res.sendStatus(403);

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		const accessToken = generateAccessToken({ _id: user._id });
		res.send({ accessToken: accessToken, user: user });
	});
});

// Login
route.post("/jwt/create", async (req, res) => {
	const { error } = loginValidation(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });

	// Check User Exists
	const user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send({ message: "Email is not found" });

	// Check Password is Correct
	const validPass = await bcrypt.compare(req.body.password, user.password);
	if (!validPass) return res.status(400).send({ message: "Invalid Password" });

	// Create and assign a token
	const refreshToken = jwt.sign(
		{ _id: user._id },
		process.env.REFRESH_TOKEN_SECRET
	);
	const accessToken = generateAccessToken({ _id: user._id });
	const token = new Token({ refreshToken: refreshToken });
	token.save();
	res.send({ accessToken: accessToken, refreshToken: refreshToken });
});

// Verify
route.post("/jwt/verify", (req, res) => {
	const token = req.body.token;
	// if (!token) return res.sendStatus(400);

	const verified = jwt.verify(
		token,
		process.env.ACCESS_TOKEN_SECRET,
		(err, _) => {
			if (err) res.status(403).send({ message: "token_not_valid" });
		}
	);
	res.sendStatus(200);
});

// GenerateAccessToken
function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

module.exports = route;
