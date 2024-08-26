from flask import Flask, request, jsonify, send_from_directory
import yt_dlp
from flask_cors import CORS
import os
import isodate
import urllib.parse


app = Flask(__name__)
CORS(app)

DOWNLOAD_FOLDER = 'public'
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

@app.route("/api/youtube-info", methods=['POST'])
def youtube_info():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        ydl_opts = {
            'format': 'best',
            'skip_download': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)

        # Convert duration from seconds to HH:MM:SS format
        duration_seconds = info_dict.get('duration')
        duration = str(isodate.parse_duration(f'PT{duration_seconds}S'))

        # Get available formats
        formats = info_dict.get('formats', [])
        quality_options = set()
        for f in formats:
            if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                resolution = f.get('resolution', 'unknown')
                if resolution != 'unknown':
                    quality_options.add(resolution)

        return jsonify({
            'title': info_dict.get('title'),
            'thumbnail': info_dict.get('thumbnail'),
            'duration': duration,
            'quality': list(quality_options)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/youtube-download', methods=['POST'])
def youtube_download():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        ydl_opts = {
            'format': 'best',
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s')
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            filename = os.path.basename(ydl.prepare_filename(info_dict))
            filepath = os.path.abspath(os.path.join(DOWNLOAD_FOLDER, filename))

        return jsonify({'filename': filename, 'filepath': filepath})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/downloads/<path:filename>", methods=['GET'])
def download_file(filename):
    decoded_filename = urllib.parse.unquote(filename)
    return send_from_directory(DOWNLOAD_FOLDER, decoded_filename)

@app.route('/')
def welcome():
    return "Welcome to Flask server and it's running"


if __name__ == '__main__':
    app.run(port=3001, debug=True)