import base64, tempfile
from io import BytesIO
from PIL import Image

def base64_to_pil(b64: str) -> Image.Image:
    img_bytes = base64.b64decode(b64)
    return Image.open(BytesIO(img_bytes))

def base64_to_tempfile(b64: str) -> str:
    """Write to a temp file and return its path (for libs that want a path)."""
    img_bytes = base64.b64decode(b64)
    suffix = ".jpg"   # or parse magic bytes for PNG, etc.
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(img_bytes)
    tmp.flush()
    return tmp.name
