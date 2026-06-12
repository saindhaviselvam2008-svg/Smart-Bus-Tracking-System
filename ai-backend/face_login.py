import cv2
import face_recognition
import numpy as np
import os

# LOAD KNOWN FACES
known_face_encodings = []
known_face_names = []

known_folder = "dataset"

for file in os.listdir(known_folder):

    if file.endswith(".jpg") or file.endswith(".png"):

        image_path = os.path.join(
            known_folder,
            file
        )

        image = face_recognition.load_image_file(
            image_path
        )

        encodings = face_recognition.face_encodings(
            image
        )

        if len(encodings) > 0:

            known_face_encodings.append(
                encodings[0]
            )

            known_face_names.append(
                file.split(".")[0]
            )

# START CAMERA
video_capture = cv2.VideoCapture(0)

while True:

    ret, frame = video_capture.read()

    if not ret:
        break

    # SMALL FRAME FOR SPEED
    small_frame = cv2.resize(
        frame,
        (0, 0),
        fx=0.25,
        fy=0.25
    )

    rgb_small_frame = cv2.cvtColor(
        small_frame,
        cv2.COLOR_BGR2RGB
    )

    # FIND FACES
    face_locations = face_recognition.face_locations(
        rgb_small_frame
    )

    face_encodings = face_recognition.face_encodings(
        rgb_small_frame,
        face_locations
    )

    for (top, right, bottom, left), face_encoding in zip(
        face_locations,
        face_encodings
    ):  
        matches = face_recognition.compare_faces(
    known_face_encodings,
    face_encoding,
    tolerance=0.45
)

        

        name = "UNKNOWN"

        face_distances = face_recognition.face_distance(
            known_face_encodings,
            face_encoding
        )

        if len(face_distances) > 0:

            best_match_index = np.argmin(
                face_distances
            )

            if matches[best_match_index]:

                name = known_face_names[
                    best_match_index
                ]

        # SCALE BACK
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        # FACE BOX
        cv2.rectangle(
            frame,
            (left, top),
            (right, bottom),
            (0, 255, 0),
            2
        )

        # NAME BOX
        cv2.rectangle(
            frame,
            (left, bottom - 35),
            (right, bottom),
            (0, 255, 0),
            cv2.FILLED
        )

        cv2.putText(
            frame,
            name,
            (left + 6, bottom - 6),
            cv2.FONT_HERSHEY_DUPLEX,
            1.0,
            (255, 255, 255),
            1
        )

    cv2.imshow(
        "WayPoint Face Recognition",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()