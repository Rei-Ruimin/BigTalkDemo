from time import sleep
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
import requests


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
            response_data = process_media(video_file, audio_file)
            return render(request, 'result.html', {'data': response_data})
        else:
            return HttpResponse("No video or audio file uploaded.", status=400)
    return HttpResponse("Invalid request", status=400)

def process_media(video_file, audio_file):
    # Prepare the result dictionary
    result = {'video_status': f'Processed {video_file.name}'}
    url = "https://api.deepgram.com/v1/listen?filler_words=true"
    headers = {
        "Authorization": 'Token 17e4f14bc5e82df0ece99c45eec4755855b27860',  # Replace DEEPGRAM_API_KEY with your actual API key
        "Content-Type": "audio/*"
    }

    audio_file = audio_file.read()

    # Send the audio file to Deepgram
    response = requests.post(url, headers=headers, data=audio_file)

    result['audio_status'] = response.json()
    # Return the JSON response from Deepgram to the frontend
    return result
    

