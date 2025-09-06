import qrcode
import base64
from io import BytesIO
from django.conf import settings
import os

def generate_qr_code(data, size=10):
    """Generate QR code image and return as base64 string"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=size,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def save_qr_code_image(data, filename):
    """Save QR code as image file"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Create media directory if it doesn't exist
    media_dir = os.path.join(settings.MEDIA_ROOT, 'qrcodes')
    os.makedirs(media_dir, exist_ok=True)
    
    filepath = os.path.join(media_dir, filename)
    img.save(filepath)
    
    return filepath
