const video = document.getElementById('video');
// const dataDiv = document.getElementById('data');
const apiKey = '8ZLfLdXJolDS0rBfqcEacpLAnZPHqH37euCSdAz5uyOqGwn1';
const wsUri = `wss://api.hume.ai/v0/stream/models?api_key=${apiKey}`;
let websocket = null;
let videoStream = null;
let mediaRecorder = null;


function initWebSocket() {
    if (websocket === null) {
        websocket = new WebSocket(wsUri);
        websocket.onopen = function(evt) { console.log("Connected to WebSocket"); };
        websocket.onclose = function(evt) { console.log("Disconnected from WebSocket"); };
        websocket.onmessage = function(evt) { onMessage(evt); };
        websocket.onerror = function(evt) { console.error("WebSocket Error: " + evt.data); };
    }
}

function onMessage(evt) {
    // Parse the JSON data
    const data = JSON.parse(evt.data);

    // Assuming 'data.face.predictions[0].emotions' contains the array of emotions
    const emotions = data.face.predictions[0].emotions;

    // Sort the emotions by score
    emotions.sort((a, b) => b.score - a.score);

    // Update the UI
    updateEmotionsDisplay(emotions);
}

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


function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            videoStream = stream;
            initWebSocket();
            startSendingVideo();
        })
        .catch(error => {
            console.error('Error accessing the camera.', error);
            alert('Error accessing the camera.');
        });
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
    if (websocket) {
        websocket.close();
        websocket = null;
    }

}

function startSendingVideo() {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    function sendFrame() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            const reader = new FileReader();
            reader.onload = function() {
                const base64data = reader.result.split(',')[1];
                const jsonPayload = JSON.stringify(
                { 
                    data: base64data, 
                    models: {
                        face: {}
                    }
                });
                if (websocket && websocket.readyState === WebSocket.OPEN) {
                    websocket.send(jsonPayload);
                }
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg');
    }

    sendInterval = setInterval(sendFrame, 100); // Send frames every 100ms
}

document.getElementById('startButton').addEventListener('click', startVideo);
document.getElementById('stopButton').addEventListener('click', stopVideo);
