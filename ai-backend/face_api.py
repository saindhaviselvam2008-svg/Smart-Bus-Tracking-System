from flask import Flask, jsonify
from flask_cors import CORS
from deepface import DeepFace
import cv2
import os

app = Flask(__name__)
# Enable CORS so your React frontend (port 5173) can talk to this backend safely
CORS(app)

@app.route("/face-login", methods=["GET"])
def face_login():
    print("🎬 React button clicked! Initializing camera hardware...")
    
    # Open webcam context safely inside the function call
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not access or open webcam hardware.")
        return jsonify({"name": "Unknown", "error": "Camera access failed"})

    # Capture a single frame
    ret, frame = cap.read()
    cap.release()  # Turn off camera hardware immediately so it doesn't lock up

    if not ret:
        print("❌ Error: Failed to grab image frame from camera.")
        return jsonify({"name": "Unknown"})

    try:
        # Check if the dataset directory exists
        if not os.path.exists("dataset"):
            print("❌ Error: 'dataset' folder is missing in ai-backend folder.")
            return jsonify({"name": "Unknown", "error": "Dataset directory missing"})

        print("🔍 Scanning frame against image profiles inside 'dataset' folder...")
        # DeepFace searches your dataset folder profiles directly
        result = DeepFace.find(
            img_path=frame,
            db_path="dataset",
            enforce_detection=False,
            model_name="VGG-Face"
        )
        
        # Check if a known identity profile matched in the result list
        if len(result) > 0 and not result[0].empty:
            matched_path = result[0]['identity'][0]
            # Extract the folder profile name (the student's identity)
            detected_name = os.path.basename(os.path.dirname(matched_path))
            print(f"✅ Match Found! Welcome back, {detected_name}.")
            return jsonify({"name": detected_name})
        else:
            print("👤 Unknown Face: Face detected but not matched in database records.")
            return jsonify({"name": "Unknown"})
            
    except Exception as e:
        print("❌ DeepFace Pipeline Error:", str(e))
        return jsonify({"name": "Unknown", "error": str(e)})

if __name__ == "__main__":
    # Run server explicitly on port 5001 to sync with React requests
    app.run(debug=True, port=5001)