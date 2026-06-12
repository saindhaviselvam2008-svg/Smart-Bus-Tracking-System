import cv2
import os
import numpy as np
from PIL import Image
import pickle

dataset_path = "dataset"

recognizer = cv2.face.LBPHFaceRecognizer_create(
    radius=2,
    neighbors=12,
    grid_x=8,
    grid_y=8
)

detector = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

x_train = []
y_labels = []

label_ids = {}
current_id = 0

IMAGE_SIZE = 200

for person_name in os.listdir(dataset_path):

    person_path = os.path.join(
        dataset_path,
        person_name
    )

    if not os.path.isdir(person_path):
        continue

    label_ids[current_id] = person_name

    print(f"Loading {person_name}")

    for image_name in os.listdir(person_path):

        image_path = os.path.join(
            person_path,
            image_name
        )

        try:

            pil_image = Image.open(
                image_path
            ).convert("L")

            image_np = np.array(
                pil_image,
                "uint8"
            )

            faces = detector.detectMultiScale(
                image_np,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(100, 100)
            )

            for (x, y, w, h) in faces:

                roi = image_np[
                    y:y+h,
                    x:x+w
                ]

                roi = cv2.resize(
                    roi,
                    (IMAGE_SIZE, IMAGE_SIZE)
                )

                roi = cv2.equalizeHist(
                    roi
                )

                x_train.append(roi)
                y_labels.append(current_id)

        except Exception as e:

            print("Error:", image_path)
            print(e)

    current_id += 1

with open("labels.pkl", "wb") as f:
    pickle.dump(label_ids, f)

recognizer.train(
    x_train,
    np.array(y_labels)
)

recognizer.save("trainer.yml")

print("Training completed")