const HUME_API_KEY = 'eXnA5QOGa1cqARv1QCAl8mcN8X3gXH6QVIGWCn5JaUpCfkyD';
let websocket = null;

//export function initWebSocket(INPUT_API_KEY) {
export function initWebSocket() {
    if (!websocket) {
        // HUME_API_KEY = INPUT_API_KEY || HUME_API_KEY;
        const wsUri = `wss://api.hume.ai/v0/stream/models?api_key=${HUME_API_KEY}`;

        websocket = new WebSocket(wsUri);
        websocket.onopen = () => console.log("Connected to WebSocket");
        websocket.onclose = () => console.log("Disconnected from WebSocket");
        websocket.onmessage = handleWebSocketMessage;
        websocket.onerror = (evt) => console.error("WebSocket Error: ", evt);
    }
}

function handleWebSocketMessage(evt) {
    try {
        const data = JSON.parse(evt.data);
        if (data.face && data.face.predictions && data.face.predictions.length > 0) {
            const emotions = data.face.predictions[0].emotions;
            document.dispatchEvent(new CustomEvent('emotionsReceived', { detail: emotions }));
        } else {
            console.log("No emotion data received or data in unexpected format:", data);
        }
    } catch (error) {
        console.error("Error processing WebSocket message:", error);
    }
}


export function sendFrame(base64data) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        const jsonPayload = JSON.stringify({ data: base64data, models: { face: {} } });
        websocket.send(jsonPayload);
    }
}

export function closeWebSocket() {
    if (websocket) {
        websocket.close();
        websocket = null;
    }
}
