require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to parse JSON payloads
app.use(express.json());

// Environment variables for the Discord webhook URL and the secret key
const SECRET_KEY = process.env.WEBHOOK_BRIDGE_SECRET_KEY;

// Middleware to check the secret key
app.use((req, res, next) => {
	const secretAuthHeader = req.headers.secret;
	if (secretAuthHeader) {
		const token = secretAuthHeader.split(' ')[1];
		if (token === SECRET_KEY) {
			next();
			return;
		}
	}
	res.status(401).send('Unauthorized: Incorrect or missing Bearer token');
});

// Route to handle incoming webhooks
app.post('/webhook/:id/:token', async (req, res) => {
	const discordWebhookId = req.params.id;
	const discordWebhookToken = req.params.token;
	const discordWebhookUrl = `https://discord.com/api/webhooks/${discordWebhookId}/${discordWebhookToken}`;

	// Extract the Authorization header from the incoming request
	const authHeader = req.headers.authorization;

	const headers = {};
	if (authHeader) {
			// Include the Authorization header in the request to Discord
			headers['Authorization'] = authHeader;
	}

	try {
			await axios.post(discordWebhookUrl, req.body, { headers });
			res.status(200).send('Webhook sent to Discord successfully');
	} catch (error) {
			console.error('Error sending to Discord:', error);
			res.status(500).send('Error sending webhook to Discord');
	}
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
