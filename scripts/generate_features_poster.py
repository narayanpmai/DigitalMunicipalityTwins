import os
from PIL import Image, ImageFont, ImageDraw, ImageFilter

W, H = 1200, 1600
poster = Image.new("RGBA", (W, H), (11, 17, 32, 255))
draw = ImageDraw.Draw(poster)

# Gradient background
for y in range(H):
    factor = y / float(H)
    if factor < 0.4:
        r = int(7 + (15 - 7) * (factor / 0.4))
        g = int(12 + (28 - 12) * (factor / 0.4))
        b = int(24 + (54 - 24) * (factor / 0.4))
    else:
        r = int(15 - (15 - 4) * ((factor - 0.4) / 0.6))
        g = int(28 - (28 - 8) * ((factor - 0.4) / 0.6))
        b = int(54 - (54 - 18) * ((factor - 0.4) / 0.6))
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# Fonts
font_path_b = "C:/Windows/Fonts/NirmalaB.ttf"
font_path_r = "C:/Windows/Fonts/Nirmala.ttf"
font_path_segoe_b = "C:/Windows/Fonts/segoeuib.ttf"

font_top_gov = ImageFont.truetype(font_path_b, 24)
font_top_sub = ImageFont.truetype(font_path_r, 18)
font_badge = ImageFont.truetype(font_path_b, 16)

font_hero_title = ImageFont.truetype(font_path_segoe_b, 46)
font_hero_sub = ImageFont.truetype(font_path_b, 24)

font_sec_heading = ImageFont.truetype(font_path_b, 26)

font_card_title = ImageFont.truetype(font_path_b, 21)
font_card_desc = ImageFont.truetype(font_path_r, 15)

font_footer_h = ImageFont.truetype(font_path_b, 22)
font_footer_url = ImageFont.truetype(font_path_segoe_b, 20)

font_dev_label = ImageFont.truetype(font_path_b, 15)
font_dev_name = ImageFont.truetype(font_path_segoe_b, 21)
font_dev_role = ImageFont.truetype(font_path_b, 16)
font_dev_palika = ImageFont.truetype(font_path_r, 15)

font_qr_label = ImageFont.truetype(font_path_b, 13)

# 1. TOP HEADER (y: 35 to 135)
draw.rounded_rectangle([45, 35, W - 45, 135], radius=16, fill=(15, 23, 42, 190), outline=(56, 189, 248, 60), width=1)

# Emblem
try:
    emblem = Image.open("frontend/public/emblem-of-nepal.png").convert("RGBA")
    emblem.thumbnail((75, 75), Image.Resampling.LANCZOS)
    poster.paste(emblem, (65, 45), emblem)
except Exception as e:
    print(f"Emblem load error: {e}")

# Header text
draw.text((155, 48), "पाँचपोखरी थाङपाल गाउँपालिका", fill=(255, 255, 255), font=font_top_gov)
draw.text((155, 82), "गाउँकार्यपालिकाको कार्यालय • बागमती प्रदेश, नेपाल", fill=(56, 189, 248), font=font_top_sub)

# Right Badge: Live v2.0-ts
badge_x1, badge_y1, badge_x2, badge_y2 = W - 265, 55, W - 65, 95
draw.rounded_rectangle([badge_x1, badge_y1, badge_x2, badge_y2], radius=20, fill=(6, 78, 59, 200), outline=(52, 211, 153), width=1)
draw.ellipse([badge_x1 + 14, badge_y1 + 14, badge_x1 + 24, badge_y1 + 24], fill=(52, 211, 153))
draw.text((badge_x1 + 34, badge_y1 + 9), "LIVE DIGITAL TWINS", fill=(167, 243, 208), font=font_badge)

# 2. HERO TITLE SECTION (y: 150 to 255)
hero_badge_text = "🚀 स्मार्ट स्थानीय सरकार तथा एकीकृत डिजिटल रूपान्तरण"
draw.rounded_rectangle([W//2 - 270, 150, W//2 + 270, 186], radius=18, fill=(30, 58, 138, 120), outline=(56, 189, 248, 120), width=1)
draw.text((W//2 - 250, 156), hero_badge_text, fill=(125, 211, 252), font=font_badge)

title_text = "MUNICIPAL DIGITAL TWINS"
bbox_title = draw.textbbox((0, 0), title_text, font=font_hero_title)
title_w = bbox_title[2] - bbox_title[0]
draw.text(((W - title_w) // 2, 195), title_text, fill=(255, 255, 255), font=font_hero_title)

sub_text = "नेपालकै पहिलो पूर्ण एकीकृत ३D डिजिटल स्थानीय सरकार प्रणाली"
bbox_sub = draw.textbbox((0, 0), sub_text, font=font_hero_sub)
sub_w = bbox_sub[2] - bbox_sub[0]
draw.text(((W - sub_w) // 2, 252), sub_text, fill=(147, 197, 253), font=font_hero_sub)

# 3. 3D VISUAL SHOWCASE (y: 295 to 640)
try:
    bg_3d = Image.open("frontend/public/assets/municipal_digital_twins_poster.jpg").convert("RGBA")
    target_w, target_h = W - 90, 345
    bg_crop = bg_3d.resize((target_w, int(bg_3d.height * (target_w / bg_3d.width))), Image.Resampling.LANCZOS)
    crop_top = (bg_crop.height - target_h) // 3
    bg_final = bg_crop.crop((0, crop_top, target_w, crop_top + target_h))
    
    mask = Image.new("L", (target_w, target_h), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rounded_rectangle([0, 0, target_w, target_h], radius=18, fill=255)
    
    poster.paste(bg_final, (45, 295), mask)
    draw.rounded_rectangle([45, 295, W - 45, 295 + target_h], radius=18, outline=(56, 189, 248, 180), width=2)
    
    # Bottom glass caption over 3D image
    draw.rounded_rectangle([45, 295 + target_h - 70, W - 45, 295 + target_h], radius=0, fill=(2, 6, 23, 215))
    draw.text((65, 295 + target_h - 60), "3D GIS Topography & Spatial Intelligence", fill=(255, 255, 255), font=font_card_title)
    draw.text((65, 295 + target_h - 32), "पालिकाका सम्पूर्ण भौतिक पूर्वाधार, सडक, घर, योजना तथा सार्वजनिक सम्पत्तिको वास्तविक ३D नक्सा", fill=(147, 197, 253), font=font_card_desc)
    
    # Right pill on image
    draw.rounded_rectangle([W - 355, 295 + target_h - 62, W - 65, 295 + target_h - 18], radius=10, fill=(30, 58, 138, 220), outline=(56, 189, 248), width=1)
    draw.text((W - 340, 295 + target_h - 54), "✓ ७५३ वटै स्थानीय तहका लागि तयार", fill=(224, 242, 254), font=font_badge)
except Exception as e:
    print(f"3D image composite error: {e}")

# 4. SECTION HEADER (y: 660 to 700)
draw.text((50, 660), "प्रणालीका मुख्य डिजिटल विशेषताहरू (Key Core Modules)", fill=(255, 255, 255), font=font_sec_heading)
draw.line([(50, 698), (W - 50, 698)], fill=(56, 189, 248, 80), width=2)

# 5. SIX DETAILED FEATURE CARDS (y: 715 to 1320)
features = [
    {
        "icon": "1. 3D GIS जुम्ल्याहा (3D Municipal Twin)",
        "desc": "पालिकाको समग्र भू-बनोट, पूर्वाधार, ३D सडक सञ्जाल, नदीनाला र विकास आयोजनाहरूको प्रत्यक्ष थ्रीडी स्याटेलाइट अनुगमन।"
    },
    {
        "icon": "2. अनलाइन दरखास्त र QR भुक्तानी",
        "desc": "उम्मेदवार दर्ता, Fonepay QR बाट शुल्क दाखिला, राजस्व रसिद (१४२२९) तथा परीक्षा प्रवेशपत्र प्रणालीबाटै तुरुन्त जारी।"
    },
    {
        "icon": "3. डिजिटल नागरिक वडापत्र (Badapatra)",
        "desc": "शाखागत सेवा, लाग्ने दस्तुर, आवश्यक कागजात र समय सीमाको पारदर्शी डिस्प्ले साथै स्थानीय भाषामा स्वचालित अडियो उद्घोषण।"
    },
    {
        "icon": "4. एकीकृत ई-अफिस र दर्ता-चलानी",
        "desc": "कागजविहीन कार्यप्रवाह, चालू आ.व. को आधिकारिक बहिर्गमन चलानी स्वतः दर्ता, डिजिटल टिप्पणी तथा फाइल ट्र्याकिङ।"
    },
    {
        "icon": "5. घरधुरी तथा नागरिक ३६० (MDM)",
        "desc": "वडास्तरीय घरधुरी लगत, सामाजिक सुरक्षा, जनसांख्यिकी प्रोफाइल र लक्षित वर्गका लागि पारदर्शी सेवा वितरण।"
    },
    {
        "icon": "6. राजस्व, बजेट तथा योजना व्यवस्थापन",
        "desc": "शीर्षकगत प्रत्यक्ष राजस्व सङ्कलन, योजनाको भौतिक र वित्तीय प्रगतिको डिजिटल ड्यासबोर्ड तथा पूर्ण वित्तीय पारदर्शिता।"
    }
]

col_w = (W - 120) // 2
row_h = 185
start_y = 715

for i, feat in enumerate(features):
    col = i % 2
    row = i // 2
    x1 = 50 + col * (col_w + 20)
    y1 = start_y + row * (row_h + 15)
    x2 = x1 + col_w
    y2 = y1 + row_h
    
    # Card Background with glowing border
    draw.rounded_rectangle([x1, y1, x2, y2], radius=15, fill=(15, 23, 42, 220), outline=(56, 189, 248, 85), width=1)
    draw.rounded_rectangle([x1, y1, x2, y1 + 4], radius=2, fill=(37, 99, 235))
    
    draw.text((x1 + 18, y1 + 15), feat["icon"], fill=(56, 189, 248), font=font_card_title)
    
    words = feat["desc"].split(" ")
    lines = []
    curr_line = ""
    for w in words:
        test_line = curr_line + (" " if curr_line else "") + w
        bbox = draw.textbbox((0, 0), test_line, font=font_card_desc)
        if bbox[2] - bbox[0] < col_w - 36:
            curr_line = test_line
        else:
            lines.append(curr_line)
            curr_line = w
    if curr_line:
        lines.append(curr_line)
    
    for l_idx, line in enumerate(lines[:4]):
        draw.text((x1 + 18, y1 + 55 + l_idx * 26), line, fill=(226, 232, 240), font=font_card_desc)

# 6. FOOTER & DEVELOPER CREDIT SECTION (y: 1335 to 1575)
draw.rounded_rectangle([45, 1335, W - 45, 1575], radius=20, fill=(10, 15, 30, 245), outline=(56, 189, 248, 160), width=2)

# Left Side: CTA & URL
draw.text((70, 1348), "तपाईंको पालिकालाई आजै स्मार्ट र प्रविधिमैत्री बनाउनुहोस्!", fill=(255, 255, 255), font=font_footer_h)
draw.text((70, 1382), "🌐 प्रत्यक्ष प्रणाली अवलोकन: https://digitaltwin.smartptrm.com", fill=(56, 189, 248), font=font_footer_url)

# Prominent Developer Credit Box (y: 1420 to 1560, x: 70 to W - 210)
dev_box_x1, dev_box_y1, dev_box_x2, dev_box_y2 = 65, 1420, W - 210, 1560
draw.rounded_rectangle([dev_box_x1, dev_box_y1, dev_box_x2, dev_box_y2], radius=14, fill=(15, 23, 42, 240), outline=(56, 189, 248, 130), width=1)
draw.rounded_rectangle([dev_box_x1, dev_box_y1, dev_box_x1 + 6, dev_box_y2], radius=2, fill=(16, 185, 129)) # green left accent

# Developer Details
draw.text((dev_box_x1 + 22, dev_box_y1 + 12), "👨‍💻 Developer & Technical Lead (परिकल्पना तथा प्राविधिक नेतृत्व):", fill=(56, 189, 248), font=font_dev_label)
draw.text((dev_box_x1 + 22, dev_box_y1 + 38), "Narayan Chhetri", fill=(255, 255, 255), font=font_dev_name)
draw.text((dev_box_x1 + 210, dev_box_y1 + 41), "•  IT Officer (सूचना प्रविधि अधिकृत)", fill=(52, 211, 153), font=font_dev_role)
draw.text((dev_box_x1 + 22, dev_box_y1 + 75), "Panchpokhari Thangpal Rural Municipality • पाँचपोखरी थाङपाल गाउँपालिका, बागमती प्रदेश", fill=(203, 213, 225), font=font_dev_palika)
draw.text((dev_box_x1 + 22, dev_box_y1 + 104), "📧 Official Email: it.officer@panchpokharimun.gov.np | 📱 Support & Integration Available", fill=(148, 163, 184), font=font_card_desc)

# Right Side: QR Code Container
qr_box_x = W - 185
qr_box_y = 1375
draw.rounded_rectangle([qr_box_x, qr_box_y, qr_box_x + 125, qr_box_y + 175], radius=12, fill=(255, 255, 255))

try:
    qr_img = Image.open("frontend/public/assets/nimb_fonepay_qr_code.png").convert("RGBA")
    qr_img.thumbnail((105, 105), Image.Resampling.LANCZOS)
    poster.paste(qr_img, (qr_box_x + 10, qr_box_y + 12), qr_img)
    draw.text((qr_box_x + 16, qr_box_y + 125), "स्क्यान गरी खोल्नुहोस्", fill=(15, 23, 42), font=font_qr_label)
    draw.text((qr_box_x + 22, qr_box_y + 148), "LIVE PORTAL", fill=(37, 99, 235), font=font_qr_label)
except Exception as e:
    print(f"QR paste error: {e}")

# EXPORT BOTH PNG AND JPG FORMATS
output_dir_front = "frontend/public/assets"
output_dir_brain = r"C:\Users\Administrator\.gemini\antigravity\brain\d667eba2-7753-4fa4-98d9-c01d86e96e65"

# Save PNG
png_path_front = os.path.join(output_dir_front, "Municipal_Digital_Twins_Features_Poster.png")
png_path_brain = os.path.join(output_dir_brain, "Municipal_Digital_Twins_Features_Poster.png")

poster.save(png_path_front, format="PNG", optimize=True)
poster.save(png_path_brain, format="PNG", optimize=True)
print(f"PNG saved: {png_path_front}")

# Save JPG (Convert to RGB)
rgb_poster = poster.convert("RGB")
jpg_path_front = os.path.join(output_dir_front, "Municipal_Digital_Twins_Features_Poster.jpg")
jpg_path_brain = os.path.join(output_dir_brain, "Municipal_Digital_Twins_Features_Poster.jpg")

rgb_poster.save(jpg_path_front, format="JPEG", quality=95, optimize=True)
rgb_poster.save(jpg_path_brain, format="JPEG", quality=95, optimize=True)
print(f"JPG saved: {jpg_path_front}")
