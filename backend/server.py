from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import asyncio
import io
import base64
import requests
import httpx
import numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageStat
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from starlette.staticfiles import StaticFiles

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# Emergent managed email proxy. This is a CONSTANT — never read it from
# os.environ, so it survives deployment.
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "M M Good Choice Furniture")

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER")

UPLOAD_DIR = ROOT_DIR / "uploads"
(UPLOAD_DIR / "catalogue").mkdir(parents=True, exist_ok=True)


def enhance_image(data: bytes) -> bytes:
    """Presentation-only enhancement: crop phone watermark bars, correct white
    balance/exposure, improve sharpness. The furniture itself is never altered."""
    img = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = img.size
    gray = img.convert("L")
    step = max(2, int(h * 0.01))
    crop_to = h
    scanned = 0
    while scanned < int(h * 0.14):
        top = h - scanned - step
        strip = gray.crop((0, top, w, h - scanned))
        if ImageStat.Stat(strip).mean[0] > 190:
            crop_to = top
            scanned += step
        else:
            break
    if crop_to < h:
        img = img.crop((0, 0, w, crop_to))
    arr = np.asarray(img).astype(np.float32)
    means = arr.reshape(-1, 3).mean(axis=0)
    gray = means.mean()
    arr = np.clip(arr * (gray / np.maximum(means, 1)), 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)
    img = ImageOps.autocontrast(img, cutoff=1)
    if ImageStat.Stat(img.convert("L")).mean[0] < 100:
        img = ImageEnhance.Brightness(img).enhance(1.12)
    img = ImageEnhance.Color(img).enhance(1.06)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Sharpness(img).enhance(1.35)
    if max(img.size) > 1600:
        img.thumbnail((1600, 1600), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, "JPEG", quality=86, optimize=True)
    return out.getvalue()


def save_catalogue_image(data_url: str) -> str:
    _, _, b64 = data_url.partition(",")
    raw = base64.b64decode(b64)
    enhanced = enhance_image(raw)
    fname = f"cat_{uuid.uuid4().hex[:12]}.jpg"
    (UPLOAD_DIR / "catalogue" / fname).write_bytes(enhanced)
    return f"/api/uploads/catalogue/{fname}"


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
        user = await db.users.find_one({"email": email}, {"_id": 0})
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


class EnquiryIn(BaseModel):
    name: str
    phone: str
    message: str
    product: Optional[str] = ""
    email: Optional[str] = ""


class CatalogueIn(BaseModel):
    name: str
    category: str = "Other Furniture"
    price_label: str = ""
    description: str = ""
    image: Optional[str] = None
    is_new: bool = False
    is_featured: bool = False
    hidden: bool = False


class SettingsIn(BaseModel):
    offer_text: Optional[str] = None
    offer_enabled: Optional[bool] = None
    hero_subtitle: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    address: Optional[str] = None
    notify_email: Optional[str] = None
    notify_phone: Optional[str] = None


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


# ---------------- Catalogue (Our Latest Furniture) ----------------

@api_router.get("/catalogue")
async def list_catalogue():
    return await db.catalogue.find({"hidden": {"$ne": True}}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/catalogue/all")
async def list_catalogue_all(user=Depends(require_owner)):
    return await db.catalogue.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.post("/catalogue")
async def create_catalogue_item(c: CatalogueIn, user=Depends(require_owner)):
    if not c.image or not c.image.startswith("data:"):
        raise HTTPException(status_code=400, detail="A photo is required")
    doc = c.model_dump()
    doc["image"] = save_catalogue_image(c.image)
    doc["catalogue_id"] = new_id("cat")
    doc["created_at"] = now_iso()
    await db.catalogue.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/catalogue/{catalogue_id}")
async def update_catalogue_item(catalogue_id: str, c: CatalogueIn, user=Depends(require_owner)):
    doc = c.model_dump()
    if c.image and c.image.startswith("data:"):
        doc["image"] = save_catalogue_image(c.image)
    else:
        doc.pop("image", None)
    res = await db.catalogue.update_one({"catalogue_id": catalogue_id}, {"$set": doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return await db.catalogue.find_one({"catalogue_id": catalogue_id}, {"_id": 0})


@api_router.delete("/catalogue/{catalogue_id}")
async def delete_catalogue_item(catalogue_id: str, user=Depends(require_owner)):
    doc = await db.catalogue.find_one({"catalogue_id": catalogue_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    img = doc.get("image", "")
    if img.startswith("/api/uploads/"):
        f = UPLOAD_DIR / img.replace("/api/uploads/", "")
        if f.exists():
            f.unlink()
    await db.catalogue.delete_one({"catalogue_id": catalogue_id})
    return {"ok": True}


# ---------------- Enquiries ----------------

async def send_enquiry_alert(doc):
    try:
        settings = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
        recipient = (settings.get("notify_email") or "").strip()
        if not recipient or not EMAIL_KEY:
            return
        row = lambda label, value: f"""
          <tr>
            <td style="padding:10px 16px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8A8077;width:130px;">{label}</td>
            <td style="padding:10px 16px;font-size:15px;color:#2D2622;font-weight:600;">{value}</td>
          </tr>"""
        html = f"""
        <div style="background:#F7F5F0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:560px;margin:0 auto;background:#F9F8F6;border-radius:16px;overflow:hidden;border:1px solid #E3DECF;">
            <div style="background:#3B2F2F;padding:24px 28px;">
              <p style="margin:0;font-size:18px;font-weight:800;color:#D4AF37;">M M Good Choice Furniture</p>
              <p style="margin:6px 0 0;font-size:13px;color:#F7F5F0;">New website enquiry received</p>
            </div>
            <table style="width:100%;border-collapse:collapse;background:#F9F8F6;">
              {row("Name", doc.get("name", ""))}
              {row("Phone", doc.get("phone", ""))}
              {row("Interested In", doc.get("product") or "—")}
              {row("Message", doc.get("message", ""))}
              {row("Received", doc.get("created_at", ""))}
            </table>
            <div style="padding:20px 28px;border-top:1px solid #E3DECF;">
              <p style="margin:0;font-size:12px;color:#8A8077;">Open your Owner Dashboard to view and manage all enquiries.</p>
            </div>
          </div>
        </div>"""
        payload = {
            "to": [recipient],
            "subject": f"New Enquiry: {doc.get('name', '')} — {doc.get('product') or 'General'}",
            "html": html,
            "from_name": EMAIL_FROM_NAME,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        if resp.status_code >= 400:
            logger.error(f"Enquiry alert email failed: {resp.status_code} {resp.text}")
        else:
            logger.info(f"Enquiry alert email sent to {recipient}")
    except Exception as e:
        logger.error(f"Enquiry alert email error: {e}")


async def send_customer_autoreply(doc):
    try:
        recipient = (doc.get("email") or "").strip()
        if not recipient or not EMAIL_KEY:
            return
        first_name = (doc.get("name", "").split(" ")[0] or "there")
        product_line = f"<p style='margin:0 0 12px;font-size:15px;color:#2D2622;'>Your interest in <strong>{doc.get('product')}</strong> has been noted.</p>" if doc.get("product") else ""
        html = f"""
        <div style="background:#F7F5F0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:560px;margin:0 auto;background:#F9F8F6;border-radius:16px;overflow:hidden;border:1px solid #E3DECF;">
            <div style="background:#3B2F2F;padding:24px 28px;">
              <p style="margin:0;font-size:18px;font-weight:800;color:#D4AF37;">M M Good Choice Furniture</p>
              <p style="margin:6px 0 0;font-size:13px;color:#F7F5F0;">Premium Wooden Furniture Crafted for Beautiful Homes</p>
            </div>
            <div style="padding:28px;">
              <p style="margin:0 0 12px;font-size:16px;color:#2D2622;">Dear {first_name},</p>
              <p style="margin:0 0 12px;font-size:15px;color:#5C524A;line-height:1.6;">Thank you for your enquiry! We have received your message and our team will call you back shortly on <strong>{doc.get('phone', '')}</strong>.</p>
              {product_line}
              <p style="margin:16px 0 0;font-size:15px;color:#5C524A;line-height:1.6;">Need us sooner? Call or WhatsApp us anytime on <strong>+91 91106 90642</strong>.</p>
            </div>
            <div style="padding:20px 28px;border-top:1px solid #E3DECF;background:#F7F5F0;">
              <p style="margin:0;font-size:12px;color:#8A8077;line-height:1.6;">M M Good Choice Furniture · Thambuchetty Palya, TC Palya, Krishnarajapuram, Bengaluru 560036<br/>Open Daily · Till 7:30 PM</p>
            </div>
          </div>
        </div>"""
        payload = {
            "to": [recipient],
            "subject": "Thank you for your enquiry — M M Good Choice Furniture",
            "html": html,
            "from_name": EMAIL_FROM_NAME,
            "contact_email": "mmchoicefurnituremunawae@gmail.com",
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        if resp.status_code >= 400:
            logger.error(f"Auto-reply email failed: {resp.status_code} {resp.text}")
        else:
            logger.info(f"Auto-reply email sent to {recipient}")
    except Exception as e:
        logger.error(f"Auto-reply email error: {e}")


async def send_sms_alert(doc):
    try:
        if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER):
            return
        settings = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
        recipient = (settings.get("notify_phone") or "").strip()
        if not recipient:
            return
        body = (
            "New Enquiry - M M Good Choice Furniture\n"
            f"Name: {doc.get('name', '')}\n"
            f"Phone: {doc.get('phone', '')}\n"
            f"Interested In: {doc.get('product') or 'General'}\n"
            f"Message: {doc.get('message', '')}"
        )
        url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                url,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
                data={"From": TWILIO_FROM_NUMBER, "To": recipient, "Body": body},
            )
        if resp.status_code >= 400:
            logger.error(f"SMS alert failed: {resp.status_code} {resp.text}")
        else:
            logger.info(f"SMS alert sent to {recipient}")
    except Exception as e:
        logger.error(f"SMS alert error: {e}")


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
    asyncio.create_task(send_enquiry_alert(doc))
    asyncio.create_task(send_customer_autoreply(doc))
    asyncio.create_task(send_sms_alert(doc))
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
    "notify_email": "",
    "notify_phone": "",
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

CATALOGUE_SEED = [
    {"url": "https://customer-assets-lxgj4vgw.emergentagent.net/job_elegant-home-furnish-3/artifacts/caigwsq8_WhatsApp%20Image%202026-08-07%20at%203.00.29%20PM%20%283%29.jpeg", "name": "3 + 2 Sofa Set", "is_new": True, "is_featured": False},
    {"url": "https://customer-assets-lxgj4vgw.emergentagent.net/job_elegant-home-furnish-3/artifacts/s67s3nw9_WhatsApp%20Image%202026-08-07%20at%203.00.29%20PM%20%282%29.jpeg", "name": "L-Shape Corner Sofa Set", "is_new": True, "is_featured": True},
    {"url": "https://customer-assets-lxgj4vgw.emergentagent.net/job_elegant-home-furnish-3/artifacts/65imas82_WhatsApp%20Image%202026-08-06%20at%208.55.21%20PM.jpeg", "name": "L-Shape Sofa Set", "is_new": False, "is_featured": True},
    {"url": "https://customer-assets-lxgj4vgw.emergentagent.net/job_elegant-home-furnish-3/artifacts/mp62km4p_WhatsApp%20Image%202026-08-06%20at%208.55.23%20PM.jpeg", "name": "L-Shape Sofa Set with Center Table", "is_new": False, "is_featured": False},
    {"url": "https://customer-assets-lxgj4vgw.emergentagent.net/job_elegant-home-furnish-3/artifacts/fk9uzefo_WhatsApp%20Image%202026-08-07%20at%203.01.12%20PM.jpeg", "name": "3 + 2 Sofa Set", "is_new": False, "is_featured": False},
]


@app.on_event("startup")
async def seed_database():
    if await db.products.count_documents({}) == 0:
        for p in SEED_PRODUCTS:
            p["product_id"] = new_id("prod")
            p["created_at"] = now_iso()
        await db.products.insert_many(SEED_PRODUCTS)
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
    if await db.catalogue.count_documents({}) == 0:
        for item in CATALOGUE_SEED:
            try:
                r = requests.get(item["url"], timeout=30)
                if r.status_code != 200:
                    continue
                data_url = "data:image/jpeg;base64," + base64.b64encode(r.content).decode()
                await db.catalogue.insert_one({
                    "catalogue_id": new_id("cat"),
                    "name": item["name"],
                    "category": "Sofas",
                    "price_label": "₹28,000 – ₹60,000",
                    "description": "Premium sofa collection designed for comfortable everyday living.",
                    "image": save_catalogue_image(data_url),
                    "is_new": item["is_new"],
                    "is_featured": item["is_featured"],
                    "hidden": False,
                    "created_at": now_iso(),
                })
            except Exception as e:
                logger.error(f"Catalogue seed failed for {item['name']}: {e}")


app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mm-good-choice-furniture-27df.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
