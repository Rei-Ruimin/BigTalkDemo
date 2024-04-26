import { initWebSocket, sendFrame, closeWebSocket } from './humeApiHandler.js';

const video = document.getElementById('video');

let videoStream = null;
let audioStream = null;

let sendInterval = null;

let videoRecorder = null;
let audioRecorder = null;

let videoRecordedBlobs = [];
let audioRecordedBlobs = [];


document.addEventListener('emotionsReceived', (event) => {
    updateEmotionsDisplay(event.detail);
});


const emotionOrder = [
    "Admiration", "Adoration", "Aesthetic Appreciation", "Amusement", "Anger", 
    "Anxiety", "Awe", "Awkwardness", "Boredom", "Calmness", "Concentration", 
    "Contemplation", "Confusion", "Contempt", "Contentment", "Craving", 
    "Determination", "Disappointment", "Disgust", "Distress", "Doubt", "Ecstasy", 
    "Embarrassment", "Empathic Pain", "Entrancement", "Envy", "Excitement", "Fear", 
    "Guilt", "Horror", "Interest", "Joy", "Love", "Nostalgia", "Pain", "Pride", 
    "Realization", "Relief", "Romance", "Sadness", "Satisfaction", "Desire", 
    "Shame", "Surprise (negative)", "Surprise (positive)", "Sympathy", "Tiredness", 
    "Triumph"
];

function updateEmotionsDisplay(emotions) {

    // Sort the emotions by score
    emotions.sort((a, b) => b.score - a.score);

    // Get top 3 emotions
    const topEmotions = emotions.slice(0, 3);

    // Update the top expressions display
    const topExpressionsDiv = document.getElementById('top-expressions');
    topExpressionsDiv.innerHTML = topEmotions.map((emotion, index) => {
        return `<div class="emotion-entry">
                    <div class="emotion-rank">${index + 1}</div>
                    <div class="emotion-name">${emotion.name}</div>
                    <div class="emotion-score">${emotion.score.toFixed(2)}</div>
                </div>`;
    }).join('');


    // Map the received emotions to an object for easy access
    const emotionsMap = emotions.reduce((acc, emotion) => {
        acc[emotion.name] = emotion.score;
        return acc;
    }, {});

    // Sort emotions by the predefined order and update the display
    const sortedEmotions = emotionOrder.map(name => ({
        name,
        score: emotionsMap[name] || 0 // Fallback to 0 if the emotion is not present
    }));

    // Use sortedEmotions to update the UI for expression levels
    const expressionLevelsDiv = document.getElementById('expression-levels');
    expressionLevelsDiv.innerHTML = sortedEmotions.map(emotion => {
        const widthPercentage = (emotion.score * 100).toFixed(2) + '%';
        return `<div class="emotion-level-entry">
                    <div class="emotion-name">${emotion.name}</div>
                    <div class="emotion-bar" style="width: ${widthPercentage}"></div>
                    <div class="emotion-score">${emotion.score.toFixed(2)}</div>
                </div>`;
    }).join('');
}


async function startVideo() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        video.srcObject = videoStream;
        initWebSocket();
        
        videoRecorder = new MediaRecorder(videoStream);
        videoRecorder.ondataavailable = event => {
            if (event.data && event.data.size > 0) {
                videoRecordedBlobs.push(event.data);
            }
        };
        videoRecorder.start(500); // collect data every 500ms

        audioRecorder = new MediaRecorder(audioStream);
        audioRecorder.ondataavailable = event => {
            if (event.data && event.data.size > 0) {
                audioRecordedBlobs.push(event.data);
            }
        };
        audioRecorder.start(500); // collect data every 500ms

        startSendingVideo();
    } catch (error) {
        console.error('Error accessing the camera.', error);
        alert('Error accessing the camera.');
    }
}

function startSendingVideo() {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    function sendFrameToAPI() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            const reader = new FileReader();
            reader.onload = function() {
                sendFrame(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg');
    }

    // TODO: get it back after debug
    sendInterval = setInterval(sendFrameToAPI, 100); // Send frames every 100ms
}




function stopVideo() {
    videoRecorder.stop();
    const videoBlob = new Blob(videoRecordedBlobs, { type: 'video/webm' });
    const videoFile = new File([videoBlob], 'recorded.webm', { type: 'video/webm' });

    audioRecorder.stop();
    const audioBlob = new Blob(audioRecordedBlobs, { type: 'audio/wav' });
    const audioFile = new File([audioBlob], 'recorded.wav', { type: 'audio/wav' });
    // downloadAudioFile(audioFile);

    stopTracksAndIntervals();
    closeWebSocket();

    onVideoAndAudioRecordingEnd(videoFile, audioFile);
}

function stopTracksAndIntervals() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    if (sendInterval) {
        clearInterval(sendInterval);
        sendInterval = null;
    }
}

function getCsrfToken() {
    // Get the CSRF token from the hidden input generated by Django
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

function onVideoAndAudioRecordingEnd(videoFile, audioFile) {
    const loadingBlock = document.getElementById('loadingBlock');
    loadingBlock.style.display = 'block';

    const demoBlock = document.getElementById('demoBlock');
    demoBlock.style.display = 'none';

    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('audioFile', audioFile);

    fetch('/upload/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCsrfToken()
        }
    }).then(response => response.text())
      .then(html => {
        document.open();
        document.write(html);
        document.close();
    }).catch(error => {
        console.error('Error:', error);
        alert('Failed to upload video and audio');
        loadingBlock.style.display = 'none';
        demoBlock.style.display = 'block';
    });
}

document.getElementById('startButton').addEventListener('click', startVideo);
document.getElementById('stopButton').addEventListener('click', stopVideo);
