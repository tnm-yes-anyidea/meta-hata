// pages/api/process.js
import { IncomingForm } from 'formidable';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Point fluent-ffmpeg to the static binaries compatible with Vercel's Linux environment
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js body parser to let formidable handle the multipart form
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = new IncomingForm({
    uploadDir: os.tmpdir(),
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing failed' });

    // Handle Formidable v2 and v3 array differences
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });

    const inputPath = file.filepath;
    const outputPath = path.join(os.tmpdir(), `clean_${file.originalFilename || 'output.jpg'}`);

    // 1. Extract metadata using ffprobe
    ffmpeg.ffprobe(inputPath, (probeErr, metadata) => {
      if (probeErr) {
         return res.status(500).json({ error: 'FFprobe failed to read metadata' });
      }

      // 2. Strip metadata using ffmpeg
      ffmpeg(inputPath)
        .outputOptions(['-map_metadata -1'])
        .save(outputPath)
        .on('end', () => {
          const cleanImageBuffer = fs.readFileSync(outputPath);
          const base64Image = `data:${file.mimetype || 'image/jpeg'};base64,${cleanImageBuffer.toString('base64')}`;

          // Cleanup Vercel's /tmp storage
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);

          res.status(200).json({
            metadata: metadata.format?.tags || metadata,
            cleanImage: base64Image,
          });
        })
        .on('error', (ffmpegErr) => {
          console.error(ffmpegErr);
          res.status(500).json({ error: 'FFmpeg failed to process image' });
        });
    });
  });
}
