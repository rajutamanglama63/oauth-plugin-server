const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const oauthRouter = express.Router();

// store keys temporarily
const keys = {};

oauthRouter.post("generate-key", (req, res) => {
    const writeKey = crypto.randomBytes(16).toString("hex");
    const readKey = crypto.randomBytes(16).toString("hex");

    keys[writeKey] = { readKey, value: null };

    res.json({ writeKey });
});

oauthRouter.get("oauth/start", (req, res) => {
    const writeKey = req.query.key;
    const state = encodeURIComponent(writeKey);

    const authUrl = `https://oauth-provider.com/auth?client_id=YOUR_CLIENT_ID&redirect_uri=https://your-server.com/oauth/callback&response_type=code&state=${state}`;

    res.redirect(authUrl)
});

oauthRouter.get("oauth/callback", async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    const writeKey = decodeURIComponent(state);

    // exchange code for token
    const response = await axios.post("https://oauth-provider.com/token", {
        method: "Post",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=${code}&grant_type=authorization_code&redirect_uri=https://your-server.com/oauth/callback`
    })

    const data = await response.json();
    const accessToken = data?.access_token;

    // Write the access token using the write key
    if (keys[writeKey]) {
        keys[writeKey].value = accessToken;

        res.send("Authentication successful. You can close this window.")
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