# -*- coding: utf-8 -*-
"""Simple unified-pink DressNest logo: flat #FF9BB5 text, white outline, dots, heart."""
import os
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = r"D:/Gao/Personal Software/yydyc/yydyc/yydyc_miniapp/images/dressnest-logo.png"
W, H = 1600, 420
SCALE = 2

# canvas
base = Image.new("RGBA", (W * SCALE, H * SCALE), (0, 0, 0, 0))
d = ImageDraw.Draw(base)

font_paths = [
    "C:/Windows/Fonts/comicbd.ttf",
    "C:/Windows/Fonts/comic.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]
font_path = next((p for p in font_paths if os.path.exists(p)), font_paths[-1])
font = ImageFont.truetype(font_path, 150 * SCALE)

TEXT = "DressNest"
PINK = (255, 155, 181)  # FF9BB5

# measure text
bb = d.textbbox((0, 0), TEXT, font=font)
tw, th = bb[2] - bb[0], bb[3] - bb[1]
tx = (W * SCALE - tw) / 2 - bb[0]
ty = (H * SCALE - th) / 2 - bb[1]

# shadow
mask = Image.new("L", (W * SCALE, H * SCALE), 0)
md = ImageDraw.Draw(mask)
md.text((tx, ty), TEXT, font=font, fill=255)
shadow = mask.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.25))
shadow_img = Image.new("RGBA", (W * SCALE, H * SCALE), PINK + (255,))
shadow_img.putalpha(shadow)
base = Image.alpha_composite(base, shadow_img)

# main text: pink fill + white stroke (draw on the freshly composited base)
d = ImageDraw.Draw(base)
d.text((tx, ty), TEXT, font=font, fill=PINK + (255,), stroke_width=5, stroke_fill=(255, 255, 255, 255))

# polka dots clipped to text
random.seed(42)
dots = Image.new("RGBA", (W * SCALE, H * SCALE), (0, 0, 0, 0))
dd = ImageDraw.Draw(dots)
for _ in range(140):
    x = random.randint(0, W * SCALE - 1)
    y = random.randint(0, H * SCALE - 1)
    if mask.getpixel((x, y)) < 50:
        continue
    r = random.randint(6, 14) * SCALE / 2
    dd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 110))
base = Image.alpha_composite(base, dots)

# little heart after text
heart = Image.new("RGBA", (100 * SCALE, 100 * SCALE), (0, 0, 0, 0))
hd = ImageDraw.Draw(heart)
pts = [(50 * SCALE, 85 * SCALE), (10 * SCALE, 42 * SCALE), (10 * SCALE, 20 * SCALE),
       (28 * SCALE, 6 * SCALE), (50 * SCALE, 18 * SCALE), (72 * SCALE, 6 * SCALE),
       (90 * SCALE, 20 * SCALE), (90 * SCALE, 42 * SCALE)]
hd.polygon(pts, fill=PINK + (255,))
# heart shadow
hm = Image.new("L", (100 * SCALE, 100 * SCALE), 0)
hmd = ImageDraw.Draw(hm)
hmd.polygon(pts, fill=255)
hs = hm.filter(ImageFilter.GaussianBlur(8)).point(lambda v: int(v * 0.25))
hs_img = Image.new("RGBA", (100 * SCALE, 100 * SCALE), PINK + (255,))
hs_img.putalpha(hs)
heart = Image.alpha_composite(hs_img, heart)

hx = tx + tw + 20 * SCALE
hy = H * SCALE / 2 - 50 * SCALE
base.alpha_composite(heart, (int(hx), int(hy)))

base = base.resize((W, H), Image.LANCZOS)
base.save(OUT)
print("saved", OUT, base.size)
