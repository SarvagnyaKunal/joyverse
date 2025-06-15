document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureButton = document.getElementById('capture');
    const analyzeButton = document.getElementById('analyze');
    if (!analyzeButton) {
        console.error('Analyze button with id="analyze" not found in the DOM!');
        return;
    }
    const capturedImage = document.getElementById('captured-image');
    const result = document.getElementById('result');
    const context = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 300;

    // Start camera on page load
    navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 300 }, facingMode: 'user' }
    }).then(stream => {
        video.srcObject = stream;
        video.play();
    }).catch(err => {
        result.textContent = 'Camera error: ' + err.message;
    });

    // Ensure analyze button is disabled initially
    analyzeButton.disabled = true;

    // Capture face
    captureButton.onclick = function() {
        if (captureButton.textContent === 'Capture Face') {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            capturedImage.src = canvas.toDataURL('image/jpeg');
            video.style.display = 'none';
            capturedImage.style.display = 'block';
            captureButton.textContent = 'Retake';
            analyzeButton.disabled = false;
        } else {
            video.style.display = 'block';
            capturedImage.style.display = 'none';
            captureButton.textContent = 'Capture Face';
            analyzeButton.disabled = true;
            result.textContent = '';
        }
    };

    // Remove previous event listeners before adding a new one
    analyzeButton.replaceWith(analyzeButton.cloneNode(true));
    const freshAnalyzeButton = document.getElementById('analyze');
    freshAnalyzeButton.disabled = analyzeButton.disabled;

    // Analyze emotion
    freshAnalyzeButton.addEventListener('click', async function() {
        if (freshAnalyzeButton.disabled) return;
        console.log('Analyze button clicked');
        result.textContent = 'Analyzing...';
        freshAnalyzeButton.disabled = true;
        try {
            // Get image from canvas
            const blob = await new Promise(resolve => {
                console.log('Creating blob from canvas...');
                canvas.toBlob(resolve, 'image/jpeg', 0.95);
            });
            if (!blob) {
                result.textContent = 'Failed to get image from canvas.';
                freshAnalyzeButton.disabled = false;
                return;
            }
            const formData = new FormData();
            formData.append('file', blob, 'face.jpg');
            result.textContent = 'Sending image for analysis...';
            console.log('Sending fetch to /predict...');
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
            console.log('Fetch response received:', response.status);
            if (!response.ok) throw new Error('Server error');
            const data = await response.json();
            console.log('Response JSON:', data);
            result.textContent = `Detected Emotion: ${data.emotion} (Confidence: ${data.confidence.toFixed(2)}%)`;
        } catch (err) {
            result.textContent = 'Error analyzing expression: ' + err.message;
            console.error('Error in analyze:', err);
        } finally {
            freshAnalyzeButton.disabled = false;
        }
    });

    // Debug: confirm script loaded and handlers attached
    console.log('Script loaded, handlers attached.');
});