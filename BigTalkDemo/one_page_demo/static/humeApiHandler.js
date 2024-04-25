const apiKey = '8ZLfLdXJolDS0rBfqcEacpLAnZPHqH37euCSdAz5uyOqGwn1';
const wsUri = `wss://api.hume.ai/v0/stream/models?api_key=${apiKey}`;
let websocket = null;

export function initWebSocket() {
    if (!websocket) {
        websocket = new WebSocket(wsUri);
        websocket.onopen = () => console.log("Connected to WebSocket");
        websocket.onclose = () => console.log("Disconnected from WebSocket");
        websocket.onmessage = handleWebSocketMessage;
        websocket.onerror = (evt) => console.error("WebSocket Error: ", evt);
    }
}

function handleWebSocketMessage(evt) {
    const data = JSON.parse(evt.data);
    const emotions = data.face.predictions[0].emotions;
    document.dispatchEvent(new CustomEvent('emotionsReceived', { detail: emotions }));
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
