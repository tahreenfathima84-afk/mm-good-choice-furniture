import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LogOut, Plus, Pencil, Trash2, X, Package, Images, Inbox, Settings as SettingsIcon,
  LayoutDashboard, MessageCircle,
} from "lucide-react";
import { api, waLink } from "../lib/api";
import { EASE } from "../components/Extras";

const CATS = ["Luxury Sofas", "Beds", "Dining Tables", "TV Units", "LCD Stands", "Wardrobes", "Coffee Tables", "Office Furniture", "Storage Units", "Shoe Racks", "Custom Furniture"];

const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

function Modal({ title, onClose, children, testid }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-espresso/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        data-testid={testid}
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-7 shadow-lift"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
          <button data-testid={`${testid}-close`} onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-copper hover:text-cream">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const emptyProduct = { name: "", category: CATS[0], price_label: "", description: "", image: "", sizes: "", featured: false };

function ProductForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || emptyProduct);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target?.type === "checkbox" ? e.target.checked : e.target.value }));

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setF((p) => ({ ...p, image: dataUrl }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...f, sizes: typeof f.sizes === "string" ? f.sizes.split(",").map((s) => s.trim()).filter(Boolean) : f.sizes };
    try {
      await onSave(payload);
      onClose();
    } catch {
      toast.error("Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-copper";

  return (
    <form onSubmit={save} className="space-y-4">
      <input data-testid="product-form-name" required value={f.name} onChange={set("name")} placeholder="Product name" className={inputCls} />
      <select data-testid="product-form-category" value={f.category} onChange={set("category")} className={inputCls}>
        {CATS.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input data-testid="product-form-price" value={f.price_label} onChange={set("price_label")} placeholder="Price label e.g. ₹16,000 – ₹35,000" className={inputCls} />
      <textarea data-testid="product-form-description" value={f.description} onChange={set("description")} rows={3} placeholder="Description" className={`${inputCls} resize-none`} />
      <input data-testid="product-form-sizes" value={Array.isArray(f.sizes) ? f.sizes.join(", ") : f.sizes} onChange={set("sizes")} placeholder="Sizes (comma separated) e.g. 4×6, 5×6.5" className={inputCls} />
      <input data-testid="product-form-image-url" value={f.image?.startsWith("data:") ? "" : f.image} onChange={set("image")} placeholder="Image URL (or upload below)" className={inputCls} />
      <div className="flex items-center gap-4">
        <label className="cursor-pointer rounded-full bg-stone px-5 py-2.5 font-btn text-xs font-semibold text-ink transition-colors hover:bg-copper hover:text-cream">
          Upload Photo
          <input data-testid="product-form-image-file" type="file" accept="image/*" onChange={pickFile} className="hidden" />
        </label>
        {f.image && <img src={f.image} alt="preview" className="h-14 w-14 rounded-xl object-cover" />}
      </div>
      <label className="flex items-center gap-2 text-sm text-inksoft">
        <input data-testid="product-form-featured" type="checkbox" checked={!!f.featured} onChange={set("featured")} className="h-4 w-4 accent-[#B87333]" /> Featured product
      </label>
      <button data-testid="product-form-save" type="submit" disabled={saving} className="w-full rounded-full bg-espresso py-3.5 font-btn text-sm font-semibold text-cream transition-colors hover:bg-copper disabled:opacity-60">
        {saving ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}

function LoginView() {
  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/owner";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  return (
    <div className="grid min-h-screen place-items-center bg-espresso noise-overlay px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
        className="w-full max-w-md rounded-3xl glass-dark p-10 text-center"
      >
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-gold/40 bg-cream/5 glow-gold">
          <span className="font-display text-2xl font-extrabold text-gradient-gold">MM</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-cream">Owner Dashboard</h1>
        <p className="mt-2 text-sm text-cream/60">Private area for M M Good Choice Furniture management.</p>
        <button
          data-testid="owner-google-login-button"
          onClick={login}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-cream py-4 font-btn text-sm font-semibold text-espresso transition-colors duration-300 hover:bg-gold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>
        <Link to="/" data-testid="owner-back-to-site" className="mt-6 inline-block text-xs text-cream/40 transition-colors hover:text-gold">
          ← Back to website
        </Link>
      </motion.div>
    </div>
  );
}

export default function Owner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(location.state?.user ? true : null);
  const [user, setUser] = useState(location.state?.user || null);
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");

  const loadAll = useCallback(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
    api.get("/gallery").then((r) => setGallery(r.data)).catch(() => {});
    api.get("/enquiries").then((r) => setEnquiries(r.data)).catch(() => {});
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.user) { loadAll(); return; }
    api.get("/auth/me")
      .then((r) => { setUser(r.data); setAuth(true); loadAll(); })
      .catch(() => setAuth(false));
  }, [location.state, loadAll]);

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setAuth(false); setUser(null);
    navigate("/owner", { replace: true });
  };

  if (auth === null) {
    return <div className="grid min-h-screen place-items-center bg-espresso"><div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>;
  }
  if (auth === false) return <LoginView />;
  if (user?.role !== "owner") {
    return (
      <div className="grid min-h-screen place-items-center bg-espresso px-4">
        <div className="max-w-md rounded-3xl glass-dark p-10 text-center">
          <h1 className="font-display text-xl font-bold text-cream">Access Restricted</h1>
          <p className="mt-3 text-sm text-cream/60">This Google account ({user?.email}) is not the registered owner. Please sign in with the owner account.</p>
          <button data-testid="owner-logout-button" onClick={logout} className="mt-6 rounded-full bg-cream px-7 py-3 font-btn text-sm font-semibold text-espresso hover:bg-gold">Sign out</button>
        </div>
      </div>
    );
  }

  const TABS = [
    ["overview", "Overview", LayoutDashboard],
    ["products", "Products", Package],
    ["gallery", "Gallery", Images],
    ["enquiries", "Enquiries", Inbox],
    ["settings", "Settings", SettingsIcon],
  ];

  const saveProduct = async (payload) => {
    if (editing) {
      const r = await api.put(`/products/${editing.product_id}`, payload);
      setProducts((p) => p.map((x) => (x.product_id === editing.product_id ? r.data : x)));
      toast.success("Product updated.");
    } else {
      const r = await api.post("/products", payload);
      setProducts((p) => [r.data, ...p]);
      toast.success("Product added.");
    }
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    setProducts((p) => p.filter((x) => x.product_id !== id));
    toast.success("Product removed.");
  };

  const addGallery = async (url, title) => {
    if (!url) { toast.error("Add an image URL or upload a photo."); return; }
    const r = await api.post("/gallery", { url, title });
    setGallery((g) => [r.data, ...g]);
    setGalleryUrl(""); setGalleryTitle("");
    toast.success("Photo added to gallery.");
  };

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-copper";

  return (
    <div data-testid="owner-dashboard" className="min-h-screen bg-sand">
      <header className="sticky top-0 z-40 glass border-b border-ink/5">
        <div className="mx-auto flex w-[min(1240px,94%)] items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-espresso font-display text-xs font-extrabold text-gold">MM</span>
            <div className="leading-tight">
              <p className="font-display text-sm font-extrabold text-ink">Owner Dashboard</p>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-copper uppercase">M M Good Choice Furniture</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.picture && <img src={user.picture} alt={user.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-gold/40" />}
            <span className="hidden text-sm font-semibold text-inksoft sm:block">{user?.name}</span>
            <Link to="/" data-testid="dashboard-view-site" className="rounded-full border border-espresso/15 px-4 py-2 font-btn text-xs font-semibold text-espresso transition-colors hover:bg-espresso hover:text-cream">View Site</Link>
            <button data-testid="dashboard-logout-button" onClick={logout} aria-label="Logout" className="grid h-9 w-9 place-items-center rounded-full bg-espresso text-cream transition-colors hover:bg-copper">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-[min(1240px,94%)] py-8">
        <div className="flex flex-wrap gap-2" data-testid="dashboard-tabs">
          {TABS.map(([id, label, Icon]) => (
            <button
              key={id}
              data-testid={`tab-${id}`}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-btn text-xs font-semibold transition-colors duration-300 ${tab === id ? "bg-espresso text-cream" : "bg-cream text-inksoft hover:bg-stone"}`}
            >
              <Icon size={14} /> {label}
              {id === "enquiries" && enquiries.length > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] text-espresso">{enquiries.length}</span>}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "overview" && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[["Products Live", products.length], ["Gallery Photos", gallery.length], ["Total Enquiries", enquiries.length], ["New Enquiries", enquiries.filter((e) => e.status === "new").length]].map(([label, val]) => (
                <div key={label} className="rounded-3xl bg-espresso p-7 shadow-luxury">
                  <p className="font-display text-4xl font-extrabold text-gradient-gold">{val}</p>
                  <p className="mt-2 font-btn text-xs font-semibold tracking-[0.2em] uppercase text-cream/70">{label}</p>
                </div>
              ))}
              <div className="rounded-3xl bg-cream p-7 shadow-luxury sm:col-span-2 lg:col-span-4">
                <p className="font-display text-lg font-bold text-ink">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</p>
                <p className="mt-1 text-sm text-inksoft">Manage products, gallery photos, offers and customer enquiries from the tabs above. Changes go live on the website instantly.</p>
              </div>
            </div>
          )}

          {tab === "products" && (
            <div>
              <div className="mb-5 flex justify-end">
                <button data-testid="add-product-button" onClick={() => { setEditing(null); setAdding(true); }} className="flex items-center gap-2 rounded-full bg-espresso px-6 py-3 font-btn text-xs font-semibold text-cream transition-colors hover:bg-copper">
                  <Plus size={15} /> Add Product
                </button>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <div key={p.product_id} data-testid={`dash-product-${p.product_id}`} className="overflow-hidden rounded-3xl bg-cream shadow-luxury">
                    <img src={p.image} alt={p.name} className="h-40 w-full object-cover" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-base font-bold text-ink">{p.name}</p>
                          <p className="text-xs font-semibold text-copper">{p.category} · {p.price_label}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button data-testid={`edit-product-${p.product_id}`} onClick={() => { setEditing(p); setAdding(true); }} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-gold">
                            <Pencil size={13} />
                          </button>
                          <button data-testid={`delete-product-${p.product_id}`} onClick={() => deleteProduct(p.product_id)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-red-800 hover:text-cream">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "gallery" && (
            <div>
              <div className="mb-6 rounded-3xl bg-cream p-6 shadow-luxury">
                <p className="mb-4 font-display text-base font-bold text-ink">Add Photo</p>
                <div className="flex flex-wrap items-center gap-3">
                  <input data-testid="gallery-add-url" value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} placeholder="Image URL" className={`${inputCls} max-w-xs`} />
                  <input data-testid="gallery-add-title" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} placeholder="Title" className={`${inputCls} max-w-[180px]`} />
                  <label className="cursor-pointer rounded-full bg-stone px-5 py-3 font-btn text-xs font-semibold text-ink transition-colors hover:bg-copper hover:text-cream">
                    Upload Photo
                    <input data-testid="gallery-add-file" type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setGalleryUrl(await fileToDataUrl(f)); }} />
                  </label>
                  <button data-testid="gallery-add-button" onClick={() => addGallery(galleryUrl, galleryTitle)} className="flex items-center gap-2 rounded-full bg-espresso px-6 py-3 font-btn text-xs font-semibold text-cream transition-colors hover:bg-copper">
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {gallery.map((g) => (
                  <div key={g.image_id} data-testid={`dash-gallery-${g.image_id}`} className="group relative overflow-hidden rounded-2xl">
                    <img src={g.url} alt={g.title} className="h-40 w-full object-cover" />
                    <button data-testid={`delete-gallery-${g.image_id}`} onClick={async () => { await api.delete(`/gallery/${g.image_id}`); setGallery((x) => x.filter((i) => i.image_id !== g.image_id)); toast.success("Photo removed."); }} aria-label="Delete photo" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-espresso/80 text-cream opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-800">
                      <Trash2 size={13} />
                    </button>
                    {g.title && <p className="absolute bottom-2 left-2 rounded-full bg-espresso/70 px-3 py-1 text-[10px] font-semibold text-cream">{g.title}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "enquiries" && (
            <div className="space-y-4">
              {enquiries.length === 0 && <p className="rounded-3xl bg-cream p-10 text-center text-sm text-inksoft shadow-luxury">No enquiries yet. New website enquiries will appear here.</p>}
              {enquiries.map((e) => (
                <div key={e.enquiry_id} data-testid={`enquiry-${e.enquiry_id}`} className="flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-cream p-6 shadow-luxury">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-display text-base font-bold text-ink">{e.name}</p>
                      <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide ${e.status === "new" ? "bg-gold/25 text-copper" : "bg-stone text-inksoft"}`}>{e.status}</span>
                    </div>
                    <a href={`tel:${e.phone}`} className="mt-1 block text-sm font-semibold text-copper">{e.phone}</a>
                    {e.product && <p className="mt-1 text-xs font-semibold text-inksoft">Interested in: {e.product}</p>}
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-inksoft">{e.message}</p>
                    <p className="mt-2 text-[11px] text-mutedwarm">{new Date(e.created_at).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex gap-2">
                    <a data-testid={`enquiry-whatsapp-${e.enquiry_id}`} href={waLink(`Hello ${e.name}, thank you for your enquiry at M M Good Choice Furniture!`)} target="_blank" rel="noreferrer" aria-label="Reply on WhatsApp" className="grid h-9 w-9 place-items-center rounded-full bg-olive text-cream transition-colors hover:bg-copper">
                      <MessageCircle size={15} />
                    </a>
                    <button data-testid={`enquiry-delete-${e.enquiry_id}`} onClick={async () => { await api.delete(`/enquiries/${e.enquiry_id}`); setEnquiries((x) => x.filter((i) => i.enquiry_id !== e.enquiry_id)); toast.success("Enquiry removed."); }} aria-label="Delete enquiry" className="grid h-9 w-9 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-red-800 hover:text-cream">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "settings" && settings && (
            <form
              data-testid="settings-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const r = await api.put("/settings", settings);
                setSettings(r.data);
                toast.success("Website updated.");
              }}
              className="max-w-2xl space-y-5 rounded-3xl bg-cream p-8 shadow-luxury"
            >
              <div>
                <label className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Offer Banner Text</label>
                <input data-testid="settings-offer-text" value={settings.offer_text || ""} onChange={(e) => setSettings((s) => ({ ...s, offer_text: e.target.value }))} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 text-sm text-inksoft">
                <input data-testid="settings-offer-enabled" type="checkbox" checked={!!settings.offer_enabled} onChange={(e) => setSettings((s) => ({ ...s, offer_enabled: e.target.checked }))} className="h-4 w-4 accent-[#B87333]" />
                Show offer banner on homepage
              </label>
              <div>
                <label className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Hero Subtitle</label>
                <input data-testid="settings-hero-subtitle" value={settings.hero_subtitle || ""} onChange={(e) => setSettings((s) => ({ ...s, hero_subtitle: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Phone</label>
                <input data-testid="settings-phone" value={settings.phone || ""} onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Business Hours</label>
                <input data-testid="settings-hours" value={settings.hours || ""} onChange={(e) => setSettings((s) => ({ ...s, hours: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-btn text-xs font-semibold tracking-[0.15em] uppercase text-inksoft">Address</label>
                <textarea data-testid="settings-address" rows={2} value={settings.address || ""} onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))} className={`${inputCls} resize-none`} />
              </div>
              <button data-testid="settings-save-button" type="submit" className="rounded-full bg-espresso px-8 py-3.5 font-btn text-sm font-semibold text-cream transition-colors hover:bg-copper">
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>

      <AnimatePresence>
        {adding && (
          <Modal testid="product-modal" title={editing ? "Edit Product" : "Add Product"} onClose={() => { setAdding(false); setEditing(null); }}>
            <ProductForm initial={editing ? { ...editing, sizes: editing.sizes?.join(", ") } : emptyProduct} onSave={saveProduct} onClose={() => { setAdding(false); setEditing(null); }} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
