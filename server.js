import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environmental variables from your local hidden .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Essential middleware allowing your frontend file to talk to this server
app.use(cors());
// Sets the body size limit higher so large image string payloads don't crash
app.use(express.json({ limit: '50mb' }));

app.post('/api/upload', async (req, res) => {
    const { repo, base64Content, filename } = req.body;

    if (!repo || !base64Content || !filename) {
        return res.status(400).json({ message: 'Missing required parameters.' });
    }

    const apiUrl = `https://api.github.com/repos/${repo}/contents/images/${filename}`;

    try {
        // Secure server-to-server request hiding your GitHub token completely
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Image-Uploader-Backend'
            },
            body: JSON.stringify({
                message: `upload via secure server: ${filename}`,
                content: base64Content
            })
        });

        const data = await response.json();

        if (response.ok) {
            res.status(200).json({ success: true, filename });
        } else {
            res.status(response.status).json({ message: data.message || 'GitHub communication failed.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Secure backend gateway active at http://localhost:${PORT}`);
});