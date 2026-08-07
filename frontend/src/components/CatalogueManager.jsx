import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { api, imgSrc } from "../lib/api";
import { EASE } from "./Extras";

const CATS = ["Sofas", "Dining Tables", "Beds", "LCD / TV Stands", "Shoe Racks", "Wardrobes", "Office Furniture", "Coffee Tables", "Other Furniture"];

const emptyItem = { name: "", category: "Sofas", price_label: "", description: "", image: null, is_new: false, is_featured: false, hidden: false };

const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const inputCls = "w-full rounded-2xl border border-ink/10 bg-sand px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-copper";

function ItemForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || emptyItem);
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
    try {
      await onSave(f);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer rounded-full bg-stone px-5 py-2.5 font-btn text-xs font-semibold text-ink transition-colors hover:bg-copper hover:text-cream">
          {f.image ? "Replace Photo" : "Upload Photo"}
          <input data-testid="catalogue-form-image" type="file" accept="image/*" onChange={pickFile} className="hidden" />
        </label>
        {f.image && <img src={f.image.startsWith("data:") ? f.image : imgSrc(f.image)} alt="preview" className="h-14 w-14 rounded-xl object-cover" />}
      </div>
      <p className="text-xs text-mutedwarm">Photos are auto-enhanced for lighting and clarity — the furniture itself is never altered.</p>
      <input data-testid="catalogue-form-name" required value={f.name} onChange={set("name")} placeholder="Product name e.g. L-Shape Sofa Set" className={inputCls} />
      <select data-testid="catalogue-form-category" value={f.category} onChange={set("category")} className={inputCls}>
        {CATS.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input data-testid="catalogue-form-price" value={f.price_label} onChange={set("price_label")} placeholder="Price range e.g. ₹28,000 – ₹60,000" className={inputCls} />
      <textarea data-testid="catalogue-form-description" value={f.description} onChange={set("description")} rows={2} placeholder="Short description" className={`${inputCls} resize-none`} />
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-inksoft">
          <input data-testid="catalogue-form-new" type="checkbox" checked={!!f.is_new} onChange={set("is_new")} className="h-4 w-4 accent-[#B87333]" /> New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm text-inksoft">
          <input data-testid="catalogue-form-featured" type="checkbox" checked={!!f.is_featured} onChange={set("is_featured")} className="h-4 w-4 accent-[#B87333]" /> Featured
        </label>
      </div>
      <button data-testid="catalogue-form-save" type="submit" disabled={saving} className="w-full rounded-full bg-espresso py-3.5 font-btn text-sm font-semibold text-cream transition-colors hover:bg-copper disabled:opacity-60">
        {saving ? "Saving..." : "Save Furniture"}
      </button>
    </form>
  );
}

export default function CatalogueManager() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = () => api.get("/catalogue/all").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (f) => {
    if (editing) {
      const r = await api.put(`/catalogue/${editing.catalogue_id}`, f);
      setItems((p) => p.map((x) => (x.catalogue_id === editing.catalogue_id ? r.data : x)));
      toast.success("Furniture updated.");
    } else {
      const r = await api.post("/catalogue", f);
      setItems((p) => [r.data, ...p]);
      toast.success("Furniture added — photo enhanced automatically.");
    }
  };

  const toggleHidden = async (item) => {
    const r = await api.put(`/catalogue/${item.catalogue_id}`, { ...item, image: null, hidden: !item.hidden });
    setItems((p) => p.map((x) => (x.catalogue_id === item.catalogue_id ? r.data : x)));
    toast.success(item.hidden ? "Product restored." : "Product hidden from website.");
  };

  const remove = async (id) => {
    await api.delete(`/catalogue/${id}`);
    setItems((p) => p.filter((x) => x.catalogue_id !== id));
    toast.success("Furniture removed.");
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-inksoft">{items.length} items · hidden items are not visible on the website</p>
        <button data-testid="add-catalogue-button" onClick={() => { setEditing(null); setAdding(true); }} className="flex items-center gap-2 rounded-full bg-espresso px-6 py-3 font-btn text-xs font-semibold text-cream transition-colors hover:bg-copper">
          <Plus size={15} /> Add Furniture Photo
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.catalogue_id} data-testid={`dash-catalogue-${item.catalogue_id}`} className={`overflow-hidden rounded-3xl bg-cream shadow-luxury ${item.hidden ? "opacity-55" : ""}`}>
            <div className="relative">
              <img src={imgSrc(item.image)} alt={item.name} className="h-44 w-full object-cover" />
              <div className="absolute left-3 top-3 flex gap-2">
                {item.is_new && <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-espresso">New</span>}
                {item.is_featured && <span className="rounded-full bg-royal px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">Featured</span>}
                {item.hidden && <span className="rounded-full bg-espresso/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">Hidden</span>}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base font-bold text-ink">{item.name}</p>
                  <p className="text-xs font-semibold text-copper">{item.category}{item.price_label ? ` · ${item.price_label}` : ""}</p>
                </div>
                <div className="flex gap-1.5">
                  <button data-testid={`edit-catalogue-${item.catalogue_id}`} onClick={() => { setEditing(item); setAdding(true); }} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-gold">
                    <Pencil size={13} />
                  </button>
                  <button data-testid={`toggle-catalogue-${item.catalogue_id}`} onClick={() => toggleHidden(item)} aria-label={item.hidden ? "Restore" : "Hide"} className="grid h-8 w-8 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-olive hover:text-cream">
                    {item.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button data-testid={`delete-catalogue-${item.catalogue_id}`} onClick={() => remove(item.catalogue_id)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-red-800 hover:text-cream">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-espresso/70 p-4 backdrop-blur-md"
            onClick={() => { setAdding(false); setEditing(null); }}
          >
            <motion.div
              data-testid="catalogue-modal"
              initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-7 shadow-lift"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">{editing ? "Edit Furniture" : "Add Furniture Photo"}</h3>
                <button data-testid="catalogue-modal-close" onClick={() => { setAdding(false); setEditing(null); }} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-copper hover:text-cream">
                  <X size={16} />
                </button>
              </div>
              <ItemForm initial={editing ? { ...editing, image: null } : emptyItem} onSave={save} onClose={() => { setAdding(false); setEditing(null); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
