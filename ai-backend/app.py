# 📄 Location: ai-backend/app.py
from flask import Flask, Response, jsonify
from flask_cors import CORS  # <-- Added CORS to allow React connections
import cv2
import csv
from datetime import datetime

app = Flask(__name__)
CORS(app)  # <-- Enable CORS for cross-origin React connections

camera = cv2.VideoCapture(0)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

attendance_file = "attendance.csv"

try:
    with open(attendance_file, "x", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Time"])
except:
    pass

marked = set()

def mark_attendance(name="Student"):
    if name not in marked:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(attendance_file, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([name, now])
        marked.add(name)
        print("Attendance marked:", name)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            mark_attendance("Student")

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# 🛠️ New endpoint created specifically for your frontend button!
@app.route('/start-attendance', methods=['POST'])
def start_attendance_trigger():
    return jsonify({"success": True, "message": "Attendance pipeline running"})

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    # 🔴 Moved to port 5001 to resolve port crashes!
    app.run(debug=True, port=5001)