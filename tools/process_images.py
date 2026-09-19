from PIL import Image
import os
MAP = {
    'image1.jpeg': 'hero.jpg', 'image2.jpeg': 'ops.jpg',
    'image15.jpeg': 'platform.jpg', 'image16.jpeg': 'about.jpg',
}
os.makedirs('assets/img', exist_ok=True)
for i in range(3, 15):
    MAP[f'image{i}.jpeg'] = f'cert-{i-2:02d}.jpg'
for src, dst in MAP.items():
    img = Image.open(f'_assets_raw/{src}')
    if img.mode == 'CMYK':
        img = img.convert('RGB')
    img.save(f'assets/img/{dst}', 'JPEG', quality=82, progressive=True, optimize=True)
    print(dst, 'ok')
