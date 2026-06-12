import cv2
import pickle
import os

LABELS_PATH = "labels.pkl"
TRAINER_PATH = "trainer.yml"

if not os.path.exists(LABELS_PATH) or not os.path.exists(TRAINER_PATH):
    print("Unknown")
    exit()

with open(LABELS_PATH, "rb") as f:
    label_ids = pickle.load(f)

# Initialize OpenCV's LBPH Face Recognizer engine
recognizer = cv2.face.LBPHFaceRecognizer_create(
    radius=2, neighbors=12, grid_x=8, grid_y=8
)
recognizer.read(TRAINER_PATH)

detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

cap = cv2.VideoCapture(0)
IMAGE_SIZE = 200

# Maintain a persistent track of the last successfully detected profile match
current_session_name = "Scanning..."

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (139, 92, 246), 2) # Violet bounding box

        roi_gray = gray[y:y+h, x:x+w]
        roi_gray = cv2.resize(roi_gray, (IMAGE_SIZE, IMAGE_SIZE))
        roi_gray = cv2.equalizeHist(roi_gray)

        label_id, confidence = recognizer.predict(roi_gray)

        # 🟢 Clean tracking: Display closest match name without artificial filters dropping out
        matched_db_name = label_ids.get(label_id, "Unknown")
        current_session_name = matched_db_name

        cv2.putText(
            frame,
            f"Match: {current_session_name} (Dist: {int(confidence)})",
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0) if current_session_name != "Unknown" else (0, 0, 255),
            2
        )

    # UI Context Instruction Banners
    cv2.putText(frame, "Press SPACEBAR to Log Attendance", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    cv2.putText(frame, "Press Q to Cancel", (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    
    cv2.imshow("WAYPOINT FACE ATTENDANCE", frame)
    key = cv2.waitKey(1) & 0xFF

    # 🟢 Key Interceptor: Breaks instantly on space bar input using the active screen profile!
    if key == 32: 
        if current_session_name != "Scanning...":
            break

    if key == ord("q"):
        current_session_name = "Unknown"
        break

cap.release()
cv2.destroyAllWindows()

# 🎯 Print the final finalized identity down into the attendance_api connection pipe
print(current_session_name)