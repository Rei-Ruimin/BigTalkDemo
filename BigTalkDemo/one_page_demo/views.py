from time import sleep
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json

from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)

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
            audio_data = response_data['audio_result']
            return render(request, 'result.html', {'data': audio_data})
        else:
            return HttpResponse("No video or audio file uploaded.", status=400)
    return HttpResponse("Invalid request", status=400)

def deepgramApiHandler(video_file, audio_file):
    # Prepare the result dictionary
    result = {'video_status': f'Processed {video_file.name}'}

    # Initialize the Deepgram client
    deepgram = DeepgramClient(DEEPGRAM_API_KEY)

    # Read the audio file content
    audio_content = audio_file.read()

    payload: FileSource = {
        "buffer": audio_content,
    }
    # Options for the transcription request
    options = PrerecordedOptions(
        model="nova-2", 
        filler_words=True,  # Enable filler words
        # punctuate=True,     # Enable automatic puninctuation
        smart_format=True   # Enable smart formatting
    )

    try:
        # Transcribe the audio
        response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)

        # Store the transcription result in the result dictionary
        result['audio_result'] = process_deepgram_result(response)
        result['audio_status'] = 'Transcription successful'
    except Exception as e:
        # Handle exceptions (e.g., API errors, network issues)
        result['audio_status'] = f'Failed to transcribe audio: {str(e)}'

    print(result)
    return result



def process_deepgram_result(data):
    # Define filler words
    filler_words = set(["uh", "um", "mhmm", "mm-mm", "uh-uh", "uh-huh", "nuh-uh"])

    # Variables to accumulate data
    total_filler_count = 0
    total_duration = 0
    total_words = 0
    
    # Process each channel (assuming single speaker for simplicity)
    for channel in data["results"]["channels"]:
        for alternative in channel["alternatives"]:
            transcript = alternative["transcript"].lower()
            words = transcript.split()

            # Count filler words
            filler_count = sum(word in filler_words for word in words)
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