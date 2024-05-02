from django.shortcuts import render
from django.http import HttpResponse
import re
import requests
from django.core.files.storage import default_storage
from django.conf import settings

DEEPGRAM_API_KEY = '17e4f14bc5e82df0ece99c45eec4755855b27860'
def home(request):
    return render(request, 'home.html')

def result(request):
    return render(request, 'result.html')

def handle_video(request):
    if request.method == 'POST':
        audio_file = request.FILES.get('audioFile')
        media_file = request.FILES.get('mediaFile')
        if media_file and audio_file:
            
            media_path = 'video/meida.mp4'
            if default_storage.exists(media_path):
                default_storage.delete(media_path)
                
            default_storage.save(media_path, media_file)
            combined_url = default_storage.url(media_path)

            # Process the video and audio files
            response_data = deepgramApiHandler(audio_file)
            # print(response_data)
            try:
                audio_data = response_data['audio_result']
                return render(request, 'result.html', {'data': audio_data, 'combined_url': combined_url})
            except Exception as e:
                # print(e)
                return render(request, 'result.html', {'error': str(e), 'combined_url': combined_url})
        else:
            return HttpResponse("No video or audio file uploaded.", status=400)
    return HttpResponse("Invalid request", status=400)

def deepgramApiHandler(audio_file):
    # Prepare the result dictionary
    result = {}

    # Define the URL for the Deepgram API endpoint
    # Enable filler words & smart formatting
    url = "https://api.deepgram.com/v1/listen?summarize=v2&smart_format=true&paragraphs=true&sentiment=true&language=en&model=nova-2"

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
            paragraph_transcript = alternative["paragraphs"]["transcript"]

    # Calculate words per minute (WPM)
    wpm = total_words / (total_duration / 60) if total_duration > 0 else 0

    result = {'filler_words_count': total_filler_count,
              'words_per_minute': round(wpm, 2),
              'paragraph_transcript': paragraph_transcript}
    
    result['summary'] = 'No summary available'

    # Get summary
    summary_data = data["results"]["summary"]
    if summary_data['result'] == 'success':
        result['summary'] = summary_data['short']

    # Get sentiments
    sentiments_data = data["results"]["sentiments"]
    result['segments'] = sentiments_data['segments']
    return result