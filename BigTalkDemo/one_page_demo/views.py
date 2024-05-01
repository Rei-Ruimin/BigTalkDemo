from time import sleep
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
import re
import requests
import ffmpeg
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

DEEPGRAM_API_KEY = '17e4f14bc5e82df0ece99c45eec4755855b27860'
def home(request):
    return render(request, 'home.html')

def result(request):
    return render(request, 'result.html')

def handle_video(request):
    if request.method == 'POST':
        video_file = request.FILES.get('videoFile')
        audio_file = request.FILES.get('audioFile')
        if video_file and audio_file:
            # Process the video and audio files
            response_data = deepgramApiHandler(video_file, audio_file)

            # generate recorded video url
            video_path = default_storage.save('tmp/video.webm', video_file)
            audio_path = default_storage.save('tmp/audio.wav', audio_file)
            # Create ffmpeg input streams from the saved files
            video_input = ffmpeg.input(video_path)
            audio_input = ffmpeg.input(audio_path)
            output_path = 'tmp/combined.mp4'
            # Combine video and audio streams
            ffmpeg.concat(video_input, audio_input, v=1, a=1).output(output_path).run(overwrite_output=True)
            try:
                audio_data = response_data['audio_result']
                return render(request, 'result.html', {'data': audio_data, 'combined_url': output_path})
            except Exception as e:
                return render(request, 'result.html', {'combined_url': output_path})
        else:
            return HttpResponse("No video or audio file uploaded.", status=400)
    return HttpResponse("Invalid request", status=400)

def deepgramApiHandler(video_file, audio_file):
    # Prepare the result dictionary
    result = {'video_status': f'Processed {video_file.name}'}

    # Define the URL for the Deepgram API endpoint
    # Enable filler words & smart formatting
    url = "https://api.deepgram.com/v1/listen?model=nova-2&filler_words=true&smart_format=true"

    # Define the headers for the HTTP request
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/*"
    }

    # Read the audio file content
    audio_content = audio_file.read()

    try:
        # Transcribe the audio
        response = requests.post(url, headers=headers, data=audio_content)

        # Store the transcription result in the result dictionary
        result['audio_result'] = process_deepgram_result(response)
        result['audio_status'] = 'Transcription successful'
    except Exception as e:
        # Handle exceptions (e.g., API errors, network issues)
        result['audio_status'] = f'Failed to transcribe audio: {str(e)}'

    return result



def process_deepgram_result(data):
    data = data.json()

    # Define a regular expression pattern for filler words
    filler_words_pattern = r'\b(uh|um|mhmm|mm-mm|uh-uh|uh-huh|nuh-uh)\b'


    # Variables to accumulate data
    total_filler_count = 0
    total_duration = 0
    total_words = 0
    
    # Process each channel (assuming single speaker for simplicity)
    for channel in data["results"]["channels"]:
        for alternative in channel["alternatives"]:
            transcript = alternative["transcript"].lower()
            # Use regex to find all filler words
            filler_count = len(re.findall(filler_words_pattern, transcript))
            total_filler_count += filler_count


            # Calculate words per minute and total transcript
            for paragraph in alternative["paragraphs"]["paragraphs"]:
                duration = paragraph["end"] - paragraph["start"]
                total_duration += duration
                total_words += paragraph["num_words"]

            # Get the paragraph transcript
            paragraph_transcript = alternative["paragraphs"]["transcript"].strip()

    # Calculate words per minute (WPM)
    wpm = total_words / (total_duration / 60) if total_duration > 0 else 0


    result = {'filler_words_count': total_filler_count,
              'words_per_minute': round(wpm, 2),
              'paragraph_transcript': paragraph_transcript}
    

    return result