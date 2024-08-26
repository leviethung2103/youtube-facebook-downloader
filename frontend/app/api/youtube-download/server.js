const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3001;

app.use(cors()); // endable cors
app.use(express.json());

app.post('/api/youtube-download', async (req, res) => {
  const { url } = req.body;

  if (!ytdl.validateURL(url)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

    console.log('info', info);
    console.log('format', format);

    res.setHeader('Content-Disposition', `attachment; filename="youtube_video.mp4"`);
    ytdl(url, { format }).pipe(res).on('finish', () => {
      console.log("Downloaded video successfully");
    }).on('error', (err) => {
      console.error('Error during download:', err);
      res.status(500).send('Failed to download YouTube video');
    });
  } catch (error) {
    console.error('Error downloading YouTube video:', error);
    res.status(500).send('Failed to download YouTube video');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});