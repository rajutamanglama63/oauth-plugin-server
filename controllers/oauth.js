require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const oauthRouter = express.Router();

// store keys temporarily
const keys = {};

oauthRouter.post("/generate-key", (req, res) => {

    const writeKey = crypto.randomBytes(16).toString("hex");
    const readKey = crypto.randomBytes(16).toString("hex");

    keys[writeKey] = { readKey, value: null };

    res.json({ writeKey, readKey });
});

oauthRouter.get("/oauth/start", (req, res) => {

    const writeKey = req.query.key;
    const state = encodeURIComponent(writeKey);

    // const authUrl = `https://www.figma.com/oauth?
    // client_id=MZiLaIQZOty2xfljvPIKxU&
    // redirect_uri=callback&
    // scope=scope&
    // state=${state}&
    // response_type=code`;

    const authUrl = `https://www.figma.com/oauth?client_id=${process.env.FIGMA_CLIENT_ID}&redirect_uri=http://localhost:4000/api/oauth/callback&response_type=code&scope=files:read&state=${state}`

    res.redirect(authUrl)
});

oauthRouter.get("/oauth/callback", async (req, res) => {
    try {
        const code = req.query.code;
        const state = req.query.state;
        const writeKey = decodeURIComponent(state);

        // exchange code for token
        const response = await axios.post("https://www.figma.com/api/oauth/token",
            `client_id=${process.env.FIGMA_CLIENT_ID}&client_secret=${process.env.FIGMA_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:4000/api/oauth/callback`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const data = response.data;
        console.log("data: ", data)
        await axios.post("http://localhost:4000/api/user/create", {

            user: data.user_id,
        });

        const accessToken = data.access_token;

        // Write the access token using the write key
        if (keys[writeKey]) {
            keys[writeKey].value = accessToken;

            res.send("Authentication successful. You can close this window.");
        } else {
            res.status(400).send("Invalid state or write key.");
        }
    } catch (error) {
        console.error("Error during OAuth callback:", error.message);
        res.status(500).send("An error occurred during the authentication process.");
    }
});

oauthRouter.get("/poll", (req, res) => {
    const readKey = req.query.key;
    const writeKey = Object.keys(keys).find(key => keys[key].readKey === readKey);

    if (writeKey && keys[writeKey].value) {
        res.json({ token: keys[writeKey].value });
        delete keys[writeKey]; // Clean up after use
    } else {
        res.json({ token: null });
    }
});

module.exports = oauthRouter;