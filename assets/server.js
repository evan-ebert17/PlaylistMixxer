const axios = require('axios');

module.exports = async (req, res) => {
    const playlistId = req.query.playlistId;
    const pageToken = req.query.pageToken || '';  // Optional page token for pagination
    const apiKey = process.env.YOUTUBE_API_KEY;

    const apiUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&pageToken=${pageToken}&key=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);  // Return the data to the frontend
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ error: 'Failed to fetch playlist data' });
    }
};
