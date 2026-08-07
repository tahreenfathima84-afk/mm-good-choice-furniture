import asyncio
import base64
import os
import uuid
import sys

sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage
from server import enhance_image, UPLOAD_DIR, db, new_id, now_iso

STYLE = (
    "Professional furniture catalogue photograph. Single furniture product only, fully visible and centered. "
    "Warm premium Indian furniture showroom environment, soft natural lighting, realistic soft shadows, "
    "realistic wood textures and upholstery, authentic Indian furniture design and proportions. "
    "STRICTLY no people, no hands, no text, no logos, no watermarks, no price tags, no banners, no collages. "
    "Photorealistic, high quality, furniture is the main focus."
)

PRODUCTS = [
    # Sofas
    ("L-Shape Comfort Sofa", "Sofas", "₹28,000 – ₹60,000", "modern L-shaped fabric sofa in warm beige upholstery with plush cushions and wooden legs"),
    ("Classic 3+1+1 Sofa Set", "Sofas", "₹28,000 – ₹60,000", "3-seater sofa with two matching single armchairs in teal fabric upholstery, arranged as a set"),
    ("Family 3+2 Sofa Set", "Sofas", "₹28,000 – ₹60,000", "3-seater and 2-seater sofa set in rich brown leatherette with cushioned armrests"),
    ("Modern Sectional Sofa", "Sofas", "₹28,000 – ₹60,000", "contemporary grey fabric sectional sofa with chaise lounge"),
    ("Royal Fabric Sofa Set", "Sofas", "₹28,000 – ₹60,000", "premium royal blue fabric sofa set with deep cushioned seats and gold-tone legs"),
    # Dining Tables
    ("Compact 4-Seater Dining Table", "Dining Tables", "₹16,000 – ₹35,000", "solid wood 4-seater dining table with four cushioned chairs, walnut finish"),
    ("Classic 6-Seater Dining Set", "Dining Tables", "₹16,000 – ₹35,000", "classic 6-seater wooden dining table set with six chairs, honey oak finish"),
    ("Premium Teak 6-Seater Dining Set", "Dining Tables", "₹16,000 – ₹35,000", "premium teak wood 6-seater dining table with upholstered high-back chairs"),
    ("Modern Wooden Dining Table", "Dining Tables", "₹16,000 – ₹35,000", "modern minimal wooden dining table with four chairs, two-tone walnut and white finish"),
    ("Contemporary Family Dining Set", "Dining Tables", "₹16,000 – ₹35,000", "contemporary 6-seater dining set with wooden bench and chairs"),
    # Beds
    ("Queen Size Wooden Bed", "Beds", "₹8,500 – ₹40,000", "queen size solid wood bed with panel headboard, walnut finish, with mattress"),
    ("King Size Wooden Bed", "Beds", "₹8,500 – ₹40,000", "king size solid wood bed with tall slatted headboard, dark finish, with mattress"),
    ("Hydraulic Storage Bed", "Beds", "₹8,500 – ₹40,000", "wooden queen bed with box storage base and simple headboard, with mattress"),
    ("Modern Upholstered Bed", "Beds", "₹8,500 – ₹40,000", "modern queen bed with beige fabric upholstered cushioned headboard, with mattress"),
    ("Premium Sheesham Bed", "Beds", "₹8,500 – ₹40,000", "premium sheesham wood bed with carved headboard, honey finish, with mattress"),
    # TV Stands
    ("Modern Wooden TV Unit", "LCD / TV Stands", "₹16,000 – ₹30,000", "modern wooden TV unit with open shelves and closed cabinets, walnut finish, with a TV on top"),
    ("Wall-Style TV Console", "LCD / TV Stands", "₹16,000 – ₹30,000", "wall-mounted style floating TV console with shelves, two-tone finish"),
    ("Floor-Standing TV Cabinet", "LCD / TV Stands", "₹16,000 – ₹30,000", "floor-standing wooden TV cabinet with two doors and open center shelf"),
    ("Storage TV Unit", "LCD / TV Stands", "₹16,000 – ₹30,000", "wooden TV unit with drawers and display shelves, honey finish"),
    ("Premium Entertainment Unit", "LCD / TV Stands", "₹16,000 – ₹30,000", "large premium wooden entertainment unit with back panel and ambient shelving"),
    # Shoe Racks
    ("Compact Wooden Shoe Rack", "Shoe Racks", "₹2,000 – ₹7,000", "compact 3-shelf wooden shoe rack with open shelves"),
    ("Tall Shoe Cabinet", "Shoe Racks", "₹2,000 – ₹7,000", "tall wooden shoe cabinet with two doors, walnut finish"),
    ("Shoe Rack with Drawer", "Shoe Racks", "₹2,000 – ₹7,000", "wooden shoe rack with top drawer and slatted shelves"),
    ("Entryway Shoe Cabinet", "Shoe Racks", "₹2,000 – ₹7,000", "modern entryway shoe cabinet with cushioned seat top"),
    ("Premium Shoe Storage Rack", "Shoe Racks", "₹2,000 – ₹7,000", "premium two-door wooden shoe storage cabinet with louvre doors"),
    # Wardrobes
    ("2-Door Wooden Wardrobe", "Wardrobes", "₹18,000 – ₹45,000", "2-door wooden wardrobe with full-length mirror, walnut finish"),
    ("3-Door Wardrobe", "Wardrobes", "₹18,000 – ₹45,000", "3-door wooden wardrobe with bottom drawers, honey finish"),
    ("Large Family Wardrobe", "Wardrobes", "₹18,000 – ₹45,000", "large 4-door wooden family wardrobe with loft storage"),
    ("Sliding Door Wardrobe", "Wardrobes", "₹18,000 – ₹45,000", "modern sliding 2-door wardrobe with wood and matte laminate panels"),
    ("Premium Storage Wardrobe", "Wardrobes", "₹18,000 – ₹45,000", "premium 3-door wardrobe with mirror, drawers and loft, dark walnut"),
    # Office Furniture
    ("Wooden Office Desk", "Office Furniture", "₹6,000 – ₹25,000", "simple wooden office desk with side drawer unit"),
    ("Executive Office Desk", "Office Furniture", "₹6,000 – ₹25,000", "large executive office desk in dark wood with modesty panel"),
    ("Computer Workstation", "Office Furniture", "₹6,000 – ₹25,000", "compact computer workstation table with keyboard tray and CPU shelf"),
    ("Office Storage Cabinet", "Office Furniture", "₹6,000 – ₹25,000", "wooden office storage cabinet with two doors and shelves"),
    ("Office Desk with Drawers", "Office Furniture", "₹6,000 – ₹25,000", "wooden office desk with three drawers, walnut finish"),
    # Coffee Tables
    ("Wooden Coffee Table", "Coffee Tables", "₹4,000 – ₹15,000", "solid wood rectangular coffee table with lower shelf"),
    ("Modern Center Table", "Coffee Tables", "₹4,000 – ₹15,000", "modern rectangular center table with clean lines, two-tone finish"),
    ("Storage Coffee Table", "Coffee Tables", "₹4,000 – ₹15,000", "wooden coffee table with storage drawers"),
    ("Glass-Top Coffee Table", "Coffee Tables", "₹4,000 – ₹15,000", "glass-top coffee table with wooden frame and lower wooden shelf"),
    ("Premium Round Center Table", "Coffee Tables", "₹4,000 – ₹15,000", "premium round wooden center table with pedestal base"),
    # Other Furniture
    ("Wooden Side Table", "Other Furniture", "₹2,500 – ₹12,000", "small wooden side end table with lower shelf"),
    ("Bedside Nightstand", "Other Furniture", "₹2,500 – ₹12,000", "wooden bedside nightstand with one drawer"),
    ("Entryway Console Table", "Other Furniture", "₹2,500 – ₹12,000", "slim wooden entryway console table with two drawers"),
    ("Multipurpose Storage Cabinet", "Other Furniture", "₹2,500 – ₹12,000", "wooden multipurpose storage cabinet with doors and shelves"),
    ("Wooden Display Rack", "Other Furniture", "₹2,500 – ₹12,000", "open wooden multipurpose display rack with four shelves"),
]

DESCS = {
    "Sofas": "Premium sofa collection designed for comfortable everyday living.",
    "Dining Tables": "Elegant wooden dining solutions for modern Indian homes.",
    "Beds": "Sturdy wooden beds available in sizes 4×6, 5×6.5 and 6×6.5.",
    "LCD / TV Stands": "Elegant TV entertainment units for modern Indian living rooms.",
    "Shoe Racks": "Practical wooden shoe storage for Indian entryways.",
    "Wardrobes": "Spacious wardrobes with smart storage for modern Indian bedrooms.",
    "Office Furniture": "Work-from-home ready office furniture in seasoned wood.",
    "Coffee Tables": "Center tables that complete your living room.",
    "Other Furniture": "Thoughtfully crafted furniture for every corner of your home.",
}


async def generate_one(name, category, price, prompt):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"gen-{uuid.uuid4().hex[:8]}",
        system_message="You are a professional furniture product photographer.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    msg = UserMessage(text=f"{prompt}. {STYLE}")
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        raise RuntimeError("no image returned")
    raw = base64.b64decode(images[0]["data"])
    enhanced = enhance_image(raw)
    fname = f"cat_{uuid.uuid4().hex[:12]}.jpg"
    (UPLOAD_DIR / "catalogue" / fname).write_bytes(enhanced)
    await db.catalogue.insert_one({
        "catalogue_id": new_id("cat"),
        "name": name,
        "category": category,
        "price_label": price,
        "description": DESCS[category],
        "image": f"/api/uploads/catalogue/{fname}",
        "is_new": False,
        "is_featured": False,
        "hidden": False,
        "created_at": now_iso(),
    })


async def main():
    ok, failed = 0, []
    for i, (name, cat, price, prompt) in enumerate(PRODUCTS, 1):
        for attempt in (1, 2):
            try:
                await generate_one(name, cat, price, prompt)
                ok += 1
                print(f"[{i}/45] OK {name}", flush=True)
                break
            except Exception as e:
                print(f"[{i}/45] attempt {attempt} failed {name}: {str(e)[:120]}", flush=True)
                if attempt == 2:
                    failed.append(name)
                else:
                    await asyncio.sleep(5)
        await asyncio.sleep(1)
    print(f"DONE ok={ok} failed={len(failed)} {failed}", flush=True)


asyncio.run(main())
