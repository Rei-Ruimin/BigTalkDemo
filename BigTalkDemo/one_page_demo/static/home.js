import { initWebSocket, sendFrame, closeWebSocket } from './humeApiHandler.js';

const video = document.getElementById('video');

let videoStream = null;
let sendInterval = null;

let mediaRecorder = null;
let recordedBlobs = null;


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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        videoStream = stream;
        initWebSocket();
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


    sendInterval = setInterval(sendFrameToAPI, 100); // Send frames every 100ms
}


function stopVideo() {

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    if (sendInterval) {
        clearInterval(sendInterval);
        sendInterval = null;
    }
    closeWebSocket();
    video.srcObject = null;
    sendInterval = null;
}

document.getElementById('startButton').addEventListener('click', startVideo);
document.getElementById('stopButton').addEventListener('click', stopVideo);
