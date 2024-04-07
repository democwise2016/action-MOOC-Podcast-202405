import argparse
from youtube_transcript_api import YouTubeTranscriptApi
import os
from urllib.parse import urlparse, parse_qs

from pytube import YouTube
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from moviepy.editor import VideoFileClip

folder_path = '/output/file-cache/'
max_files = 5000

def clean_file_cache():
    # Get a list of all files in the folder
    files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]

    # Check if there are more than max_files files in the folder
    if len(files) > max_files:
        # Sort the files by creation time (you can use os.path.getmtime() for modification time)
        files.sort(key=os.path.getctime)

        # Remove the oldest file
        oldest_file = files[0]
        os.remove(oldest_file)
        print(f"Removed the oldest file: {oldest_file}")
    # else:
        # print("No need to remove files, the folder contains less than 500 files.")

def extract_youtube_id(url):
    parsed_url = urlparse(url)
    
    if parsed_url.netloc == "youtu.be":
        return parsed_url.path[1:]
    
    query_params = parse_qs(parsed_url.query)
    if 'v' in query_params:
        return query_params['v'][0]
    
    return None

def download_caption(id, seconds):
    screenshot_filename = f'/output/file-cache/{id}_{str(seconds)}.jpg'
    if os.path.exists(screenshot_filename):
        print("OK " + screenshot_filename)
        return

    try:
        # print(id)
        if id.startswith('http'):
            id = extract_youtube_id(id)
            # print(id)

        
        # Define the YouTube video URL
        video_url = 'https://www.youtube.com/watch?v=' + id  # Replace VIDEO_ID with the actual video ID

        # Define the timestamp in seconds where you want to capture the screenshot
        timestamp_seconds = seconds  # Replace with your desired timestamp

        # Create a YouTube object
        yt = YouTube(video_url)

        # Get the video stream with the highest resolution
        video_stream = yt.streams.filter(file_extension='mp4', res='720p').first()

        # Download the video segment containing the desired timestamp
        start_time = timestamp_seconds
        end_time = timestamp_seconds + 1
        downloaded_filename = f'/app/tmp/{id}_{str(start_time)}.mp4'
        video_stream.download(output_path='/app/tmp', filename=downloaded_filename, skip_existing=True)

        # Extract the video segment
        video_clip = VideoFileClip(downloaded_filename)
        timestamp_clip = video_clip.subclip(start_time, end_time)

        # Capture a screenshot at the specified timestamp
        
        timestamp_clip.save_frame(screenshot_filename, t=0.01)  # You can adjust the 't' parameter for the frame capture time

        # Clean up temporary files if necessary
        os.remove(downloaded_filename)

        clean_file_cache()
        # print(f'Screenshot captured at {timestamp_seconds} seconds: {screenshot_filename}')

        
    except Exception as e:
        raise Exception("Error: ", str(e))
        print("Error: " + str(e))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YouTube Caption Downloader")
    parser.add_argument("id", help="YouTube video ID or URL")
    parser.add_argument("seconds", help="Seconds to capture YouTube Image")
    
    args = parser.parse_args()
    seconds = float(args.seconds)
    seconds = int(seconds)

    download_caption(args.id, seconds)