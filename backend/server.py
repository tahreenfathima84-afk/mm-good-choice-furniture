from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import requests
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------- Auth ----------------

async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_owner(user=Depends(get_current_user)):
    if user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owner access only")
    return user


@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    r = requests.get(SESSION_DATA_URL, headers={"X-Session-ID": session_id}, timeout=15)
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()
    email = data["email"]
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        count = await db.users.count_documents({})
        user = {
            "user_id": new_id("user"),
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "role": "owner" if count == 0 else "member",
            "created_at": now_iso(),
        }
        await db.users.insert_one(user)
    token = data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": now_iso(),
    })
    response.set_cookie(
        "session_token", token,
        httponly=True, secure=True, samesite="none", path="/",
        max_age=7 * 24 * 3600,
    )
    return user


@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"ok": True}


# ---------------- Models ----------------

class ProductIn(BaseModel):
    name: str
    category: str
    price_label: str = "Request Price"
    description: str = ""
    image: str = ""
    sizes: List[str] = []
    featured: bool = False


class GalleryIn(BaseModel):
    url: str
    title: str = ""
    category: str = "Showroom"


class EnquiryIn(BaseModel):
    name: str
    phone: str
    message: str
    product: Optional[str] = ""


class SettingsIn(BaseModel):
    offer_text: Optional[str] = None
    offer_enabled: Optional[bool] = None
    hero_subtitle: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    address: Optional[str] = None


# ---------------- Products ----------------

@api_router.get("/products")
async def list_products():
    return await db.products.find({}, {"_id": 0}).to_list(500)


@api_router.post("/products")
async def create_product(p: ProductIn, user=Depends(require_owner)):
    doc = p.model_dump()
    doc["product_id"] = new_id("prod")
    doc["created_at"] = now_iso()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, p: ProductIn, user=Depends(require_owner)):
    res = await db.products.update_one({"product_id": product_id}, {"$set": p.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return await db.products.find_one({"product_id": product_id}, {"_id": 0})


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user=Depends(require_owner)):
    res = await db.products.delete_one({"product_id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# ---------------- Gallery ----------------

@api_router.get("/gallery")
async def list_gallery():
    return await db.gallery.find({}, {"_id": 0}).to_list(500)


@api_router.post("/gallery")
async def create_gallery_item(g: GalleryIn, user=Depends(require_owner)):
    doc = g.model_dump()
    doc["image_id"] = new_id("img")
    doc["created_at"] = now_iso()
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/gallery/{image_id}")
async def delete_gallery_item(image_id: str, user=Depends(require_owner)):
    res = await db.gallery.delete_one({"image_id": image_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"ok": True}


# ---------------- Enquiries ----------------

@api_router.post("/enquiries")
async def create_enquiry(e: EnquiryIn):
    if not e.name.strip() or not e.phone.strip() or not e.message.strip():
        raise HTTPException(status_code=400, detail="Name, phone and message are required")
    doc = e.model_dump()
    doc["enquiry_id"] = new_id("enq")
    doc["status"] = "new"
    doc["created_at"] = now_iso()
    await db.enquiries.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/enquiries")
async def list_enquiries(user=Depends(require_owner)):
    items = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api_router.delete("/enquiries/{enquiry_id}")
async def delete_enquiry(enquiry_id: str, user=Depends(require_owner)):
    res = await db.enquiries.delete_one({"enquiry_id": enquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"ok": True}


# ---------------- Settings ----------------

DEFAULT_SETTINGS = {
    "key": "site",
    "offer_text": "Festive Offer — Up to 20% off on Luxury Sofa Sets & Dining Collections",
    "offer_enabled": True,
    "hero_subtitle": "Premium Wooden Furniture Crafted for Beautiful Homes.",
    "phone": "+91 91106 90642",
    "hours": "Open Daily · Till 7:30 PM",
    "address": "Thambuchetty Palya, TC Palya, Krishnarajapuram, Bengaluru, Karnataka 560036",
}


@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"key": "site"}, {"_id": 0})
    return doc or DEFAULT_SETTINGS


@api_router.put("/settings")
async def update_settings(s: SettingsIn, user=Depends(require_owner)):
    updates = {k: v for k, v in s.model_dump().items() if v is not None}
    await db.settings.update_one({"key": "site"}, {"$set": updates}, upsert=True)
    return await db.settings.find_one({"key": "site"}, {"_id": 0})


@api_router.get("/")
async def root():
    return {"message": "M M Good Choice Furniture API"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


# ---------------- Seed ----------------

U = lambda pid: f"https://images.unsplash.com/{pid}?q=80&w=1600&auto=format&fit=crop"

SEED_PRODUCTS = [
    {"name": "Heritage Teak Dining Table", "category": "Dining Tables", "price_label": "₹16,000 – ₹35,000", "description": "Six-seater solid teak dining table with hand-polished natural finish and cushioned chairs.", "image": U("photo-1577140917170-285929fb55b7"), "sizes": [], "featured": True},
    {"name": "Royal 3-Seater Fabric Sofa", "category": "Luxury Sofas", "price_label": "₹28,000 – ₹60,000", "description": "Deep-cushioned premium fabric sofa on a seasoned hardwood frame. Built for Indian family living.", "image": U("photo-1555041469-a586c61ea9bc"), "sizes": [], "featured": True},
    {"name": "Solid Wood King Bed", "category": "Beds", "price_label": "₹8,500 – ₹40,000", "description": "Sturdy solid-wood bed with hydraulic storage option and elegant headboard.", "image": U("photo-1505693416388-ac5ce068fe85"), "sizes": ["4×6", "5×6.5", "6×6.5"], "featured": True},
    {"name": "Modern TV Entertainment Unit", "category": "TV Units", "price_label": "₹16,000 – ₹30,000", "description": "Wall-panelled TV unit with ambient shelving, drawers and cable management.", "image": U("photo-1616137466211-f939a420be84"), "sizes": [], "featured": True},
    {"name": "Classic LCD Stand", "category": "LCD Stands", "price_label": "₹16,000 – ₹30,000", "description": "Compact wooden LCD stand with closed storage and open display shelves.", "image": U("photo-1595428774223-ef52624120d2"), "sizes": [], "featured": False},
    {"name": "Sliding Door Wardrobe", "category": "Wardrobes", "price_label": "Request Price", "description": "Space-saving sliding wardrobe with mirror, lofts and premium laminate finish.", "image": U("photo-1595526114035-0d45ed16cfbf"), "sizes": [], "featured": False},
    {"name": "Compact Shoe Rack", "category": "Shoe Racks", "price_label": "₹2,000 – ₹7,000", "description": "Ventilated multi-shelf wooden shoe rack for apartments and villas.", "image": U("photo-1533090481720-856c6e3c1fdc"), "sizes": [], "featured": False},
    {"name": "Walnut Coffee Table", "category": "Coffee Tables", "price_label": "Request Price", "description": "Center coffee table in rich walnut tones with lower display shelf.", "image": U("photo-1594026112284-02bb6f3352fe"), "sizes": [], "featured": False},
    {"name": "Executive Office Desk", "category": "Office Furniture", "price_label": "Request Price", "description": "Work-from-home ready desk with drawers, keyboard tray and wire ports.", "image": U("photo-1524758631624-e2822e304c36"), "sizes": [], "featured": False},
    {"name": "Queen Size Bed with Storage", "category": "Beds", "price_label": "₹8,500 – ₹40,000", "description": "Queen bed with box storage, upholstered headboard and termite-treated wood.", "image": U("photo-1567016432779-094069958ea5"), "sizes": ["4×6", "5×6.5", "6×6.5"], "featured": False},
    {"name": "L-Shape Luxury Sofa Set", "category": "Luxury Sofas", "price_label": "₹28,000 – ₹60,000", "description": "Corner L-shape sofa set with plush cushioning for large living rooms.", "image": U("photo-1616627561950-9f746e330187"), "sizes": [], "featured": False},
    {"name": "6-Seater Dining Set", "category": "Dining Tables", "price_label": "₹16,000 – ₹35,000", "description": "Family dining set with upholstered chairs and scratch-resistant top.", "image": U("photo-1519710164239-da123dc03ef4"), "sizes": [], "featured": False},
]

SEED_GALLERY = [
    {"url": U("photo-1616486338812-3dadae4b4ace"), "title": "Modern Living Room", "category": "Living"},
    {"url": U("photo-1616594039964-ae9021a400a0"), "title": "Serene Bedroom", "category": "Bedroom"},
    {"url": U("photo-1617806118233-18e1de247200"), "title": "Warm Wood Tones", "category": "Bedroom"},
    {"url": U("photo-1615873968403-89e068629265"), "title": "Family Lounge", "category": "Living"},
    {"url": U("photo-1540574163026-643ea20ade25"), "title": "Classic Bedroom", "category": "Bedroom"},
    {"url": U("photo-1600210492486-724fe5c67fb0"), "title": "Elegant Interiors", "category": "Living"},
    {"url": U("photo-1600607687939-ce8a6c25118c"), "title": "Contemporary Home", "category": "Living"},
    {"url": U("photo-1600566753086-00f18fb6b3ea"), "title": "Apartment Living", "category": "Living"},
    {"url": U("photo-1618220179428-22790b461013"), "title": "Designer Corner", "category": "Living"},
    {"url": U("photo-1615529182904-14819c35db37"), "title": "Plush Seating", "category": "Sofas"},
    {"url": U("photo-1598928506311-c55ded91a20c"), "title": "Cozy Living Space", "category": "Living"},
    {"url": U("photo-1583847268964-b28dc8f51f92"), "title": "Evening Ambience", "category": "Living"},
    {"url": U("photo-1615874959474-d609969a20ed"), "title": "Neutral Bedroom", "category": "Bedroom"},
    {"url": U("photo-1631679706909-1844bbd07221"), "title": "Modern Apartment", "category": "Living"},
    {"url": U("photo-1567767292278-a4f21aa2d36e"), "title": "Beige Comfort", "category": "Sofas"},
    {"url": U("photo-1549497538-303791108f95"), "title": "Accent Chair", "category": "Sofas"},
    {"url": U("photo-1522708323590-d24dbb6b0267"), "title": "City Apartment", "category": "Living"},
    {"url": U("photo-1493809842364-78817add7ffb"), "title": "Bright Living Room", "category": "Living"},
    {"url": U("photo-1598300042247-d088f8ab3a91"), "title": "Studio Sofa", "category": "Sofas"},
    {"url": U("photo-1600121848594-d8644e57abab"), "title": "Luxury Suite", "category": "Bedroom"},
    {"url": U("photo-1616046229478-9901c5536a45"), "title": "Curated Interiors", "category": "Living"},
    {"url": U("photo-1519710889408-a67e1c7e0452"), "title": "Restful Bedroom", "category": "Bedroom"},
    {"url": U("photo-1586105251261-72a756497a11"), "title": "Open Plan Living", "category": "Living"},
    {"url": U("photo-1554995207-c18c203602cb"), "title": "Urban Home", "category": "Living"},
]


@app.on_event("startup")
async def seed_database():
    if await db.products.count_documents({}) == 0:
        for p in SEED_PRODUCTS:
            p["product_id"] = new_id("prod")
            p["created_at"] = now_iso()
        await db.products.insert_many(SEED_PRODUCTS)
    if await db.gallery.count_documents({}) == 0:
        for g in SEED_GALLERY:
            g["image_id"] = new_id("img")
            g["created_at"] = now_iso()
        await db.gallery.insert_many(SEED_GALLERY)
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
