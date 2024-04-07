import argparse
from pytube import YouTube
import os
 
def download_mp3(url, output_path):
    try:
        # Create a YouTube object
        youtube = YouTube(url)
        
        # Get the audio stream (MP4 format)
        audio_stream = youtube.streams.filter(only_audio=True).first()
        
        # Download the audio stream as an MP3 file
        directory = os.path.dirname(output_path)
        audio_stream.download(output_path=directory, filename=output_path)
        
        # print("Download completed successfully!")
        
    except Exception as e:
        raise Exception("Error: ", str(e))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YouTube MP3 Downloader")
    parser.add_argument("url", help="YouTube video URL")
    parser.add_argument("output_path", help="Output file path")
    
    args = parser.parse_args()
    
    download_mp3(args.url, args.output_path)