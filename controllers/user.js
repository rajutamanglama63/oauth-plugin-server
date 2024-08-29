const express = require("express");
const { addDoc } = require("firebase/firestore");
const User = require("../config");

const userRouter = express.Router();

userRouter.post("/user/create", async (req, res) => {
    try {
        const data = req.body;
        await addDoc(User, data);
        res.send({ msg: "User created successfully!" })
    } catch (error) {
        console.error("Error during user creation: ", error.message);
        res.status(500).send("An error occurred during the user creation process.");
    }
})

module.exports = userRouter;