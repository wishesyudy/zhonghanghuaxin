"""宣传片网页版生成器
用法: python tools/make_promo.py <秒数>
从原片前 N 秒生成 720p 压缩片段 assets/video/promo-<N>s.mp4，
并清理旧的 promo-*.mp4。
"""
import glob
import os
import re
import subprocess
import sys

import imageio_ffmpeg

SRC = '北京中航华信智慧消防宣传片（版本2.0）.mp4'
OUT_DIR = 'assets/video'

def main():
    secs = int(sys.argv[1])
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, f'promo-{secs}s.mp4')
    cmd = [
        ffmpeg, '-y',
        '-ss', '0', '-t', str(secs),
        '-i', SRC,
        '-vf', 'scale=1280:720:flags=lanczos',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '29',
        '-maxrate', '2500k', '-bufsize', '5000k',
        '-an', '-movflags', '+faststart',
        out,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-800:])
        sys.exit(1)
    # 清理旧版本
    for old in glob.glob(os.path.join(OUT_DIR, 'promo-*.mp4')):
        if old != out:
            os.remove(old)
    size_kb = os.path.getsize(out) // 1024
    print(f'OK promo-{secs}s.mp4 ({size_kb} KB)')

if __name__ == '__main__':
    main()
