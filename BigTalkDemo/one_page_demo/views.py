from django.shortcuts import render

def home(request):
    return render(request, 'home.html')

def result(request):
    return render(request, 'result.html')


def upload_video(request):
    if request.method == 'POST':
        video_file = request.FILES['video']
        # Process video, analyze, etc.
        result = process_video(video_file)

        # Store result in session
        request.session['video_result'] = result

        return JsonResponse({'success': True})

def result_page(request):
    result = request.session.get('video_result')
    return render(request, 'result.html', {'result': result})
