from ultralytics import YOLO

model = YOLO("config/weights/best.pt")


def recognize(image_path):
    result = model(image_path)[0]

    class_id = result.probs.top1

    return {
        "slug": result.names[class_id],
        "confidence": float(result.probs.top1conf),
    }
