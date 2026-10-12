===========================================================================
  __  __      _          _   _       _
 |  \/  | ___| |_ __ _  | | | | __ _| |_ __ _
 | |\/| |/ _ \ __/ _` | | |_| |/ _` | __/ _` |
 | |  | |  __/ || (_| | |  _  | (_| | || (_| |
 |_|  |_|\___|\__\__,_| |_| |_|\__,_|\__\__,_|
===========================================================================

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

"Hata" (हटा) means "Remove" in Hindi.
Meta-Hata is a lightning-fast, serverless web application that extracts, displays, and completely obliterates hidden EXIF metadata from your images.

---------------------------------------------------------------------------
🚨 CRITICAL PRIVACY & SECURITY WARNING 🚨
---------------------------------------------------------------------------
DO NOT UPLOAD CONFIDENTIAL, SENSITIVE, OR INTIMATE IMAGES.

While Meta-Hata scrubs your files and immediately deletes them from the
temporary /tmp storage, the images ARE still transmitted over the internet
and processed on a cloud server (Vercel).

For highly classified or deeply personal material, ALWAYS use local,
offline tools.
---------------------------------------------------------------------------

📸 THE PROBLEM
Every time you snap a photo, your device secretly embeds a digital
fingerprint into the file. This can include:
- The exact GPS coordinates of your location.
- The make, model, and serial number of your phone/camera.
- Timestamps, exposure settings, and software versions.

🛡️ THE SOLUTION
Meta-Hata acts as a digital carwash for your pictures.

✨ FEATURES
* 🔍 Interactive X-Ray Vision: Upload an image and interactively expand categories to see the exact metadata payload hidden inside it.
* 🧽 Deep Scrubbing: Utilizes FFmpeg's powerful `-map_metadata -1` flag to completely nuke all EXIF, XMP, and IPTC data.
* ⚡ Quota Guardian: Built-in 4.5MB payload limit to protect your Vercel Free Tier limits from being exhausted by massive files.
* 🚫 Zero Database: No accounts, no logs, no permanent storage.

---------------------------------------------------------------------------
💻 LOCAL DEVELOPMENT
---------------------------------------------------------------------------
Want to run it locally on your own machine?

1. Install dependencies:
   $ npm install

2. Fire up the development server:
   $ npm run dev

3. Open your browser:
   Navigate to http://localhost:3000

---------------------------------------------------------------------------
🚀 DEPLOYMENT (VERCEL FREE TIER)
---------------------------------------------------------------------------
This project is tailor-made for Vercel's Hobby Tier.

The magic happens via the `@ffmpeg-installer` and `@ffprobe-installer`
packages, which automatically pull the correct static Linux binaries into
your Vercel serverless environment during the build phase. No messy custom
Linux build layers required!

1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Deploy! (The Next.js preset works out of the box).

===========================================================================
Built with Next.js, React, and FFmpeg.
===========================================================================
