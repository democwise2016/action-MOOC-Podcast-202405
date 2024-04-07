import argparse
# Transform an audio from a YouTube video to text script with language detection.
# Author: Javed Ali (www.javedali.net)

# Description: This script will ask the user for a YouTube video URL, download the audio from the video, transform it to text, detect the language of the file and save it to a txt file.


# import required modules
import os
from urllib.parse import urlparse, parse_qs

import whisper
from pytube import YouTube


# Function to open a file
# def startfile(fn):
#     os.system('open %s' % fn)


# Function to create and open a txt file
def create_and_open_txt(text, filename):
    # Create and write the text to a txt file
    with open(filename, "w") as file:
        file.write(text)
    # startfile(filename)

def extract_youtube_id(url):
    parsed_url = urlparse(url)
    
    if parsed_url.netloc == "youtu.be":
        return parsed_url.path[1:]
    
    query_params = parse_qs(parsed_url.query)
    if 'v' in query_params:
        return query_params['v'][0]
    
    return None

def youtube_audio_to_text(url):
    try:        
        # Create a YouTube object from the URL
        yt = YouTube(url)
        id = extract_youtube_id(url)
        # print(id)

        # Get the audio stream
        audio_stream = yt.streams.filter(only_audio=True).first()

        # Download the audio stream
        output_path = "/app/tmp"
        filename = "audio-" + id + ".mp3"
        audio_stream.download(output_path=output_path, filename=filename)

        # print(f"Audio downloaded to {output_path}/{filename}")

        # Load the base model and transcribe the audio
        model = whisper.load_model("large", download_root = "/")
        result = model.transcribe("/app/tmp/audio-" + id + ".mp3")
        
        # transcribed_text = result["text"]
        # print(result["segments"])
        # print(result["language"])
        # print(transcribed_text)

        # Detect the language
        # language = detect(transcribed_text)
        # language = result["language"]
        # print(f"Detected language: {language}")

        # Create and open a txt file with the text
        with open(f"/app/tmp/str-{id}.txt", "w") as file:
            file.write(str(result["segments"]))
        
    except Exception as e:
        # raise Exception("Error: ", str(e))
        print("Error: " + str(e))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YouTube Audio-to-Text Transcription")
    parser.add_argument("url", help="YouTube video URL")
    
    args = parser.parse_args()
    
    youtube_audio_to_text(args.url)