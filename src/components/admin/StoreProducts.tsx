import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Edit2, Package, X } from "lucide-react";

type Brand = { id: string; name: string };
type Model = { id: string; name: string; brand_id: string };
type Product = { id: string; name: string; price: number; image_url: string | null; description: string | null };
type ProductModel = { product_id: string; model_id: string };

const StoreProducts = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productModels, setProductModels] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    const [{ data: b }, { data: m }, { data: p }, { data: pm }] = await Promise.all([
      supabase.from("brands").select("id, name").order("name"),
      supabase.from("models").select("id, name, brand_id").order("name"),
      supabase.from("products").select("id, name, price, image_url, description").order("name"),
      supabase.from("product_models").select("product_id, model_id"),
    ]);
    setBrands(b ?? []);
    setModels(m ?? []);
    setProducts(p ?? []);
    setProductModels(pm ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setName(""); setPrice(""); setImageUrl(""); setDescription(""); setSelectedModels([]);
    setEditingId(null); setShowForm(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setImageUrl(p.image_url ?? "");
    setDescription(p.description ?? "");
    setSelectedModels(productModels.filter(pm => pm.product_id === p.id).map(pm => pm.model_id));
    setShowForm(true);
  };

  const toggleModel = (id: string) => {
    setSelectedModels(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const submit = async () => {
    if (!name.trim() || !price) return;
    setSubmitting(true);

    if (editingId) {
      const { error } = await supabase.from("products").update({
        name: name.trim(), price: parseFloat(price), image_url: imageUrl || null, description: description || null,
      }).eq("id", editingId);
      if (error) { toast.error("Erro ao atualizar."); setSubmitting(false); return; }

      // Update product_models
      await supabase.from("product_models").delete().eq("product_id", editingId);
      if (selectedModels.length > 0) {
        await supabase.from("product_models").insert(selectedModels.map(model_id => ({ product_id: editingId, model_id })));
      }
      toast.success("Produto atualizado!");
    } else {
      const { data, error } = await supabase.from("products").insert({
        name: name.trim(), price: parseFloat(price), image_url: imageUrl || null, description: description || null,
      }).select("id").single();
      if (error || !data) { toast.error("Erro ao criar produto."); setSubmitting(false); return; }

      if (selectedModels.length > 0) {
        await supabase.from("product_models").insert(selectedModels.map(model_id => ({ product_id: data.id, model_id })));
      }
      toast.success("Produto criado!");
    }

    resetForm();
    fetchAll();
    setSubmitting(false);
  };

  const remove = async (id: string, pName: string) => {
    if (!confirm(`Remover produto "${pName}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Erro ao remover.");
    else { toast.success("Produto removido!"); fetchAll(); }
  };

  const brandName = (brandId: string) => brands.find(b => b.id === brandId)?.name ?? "";
  const getProductModels = (pid: string) => productModels.filter(pm => pm.product_id === pid);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button variant="hero" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Novo Produto
        </Button>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-heading font-bold text-sm">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
            <Button size="icon" variant="ghost" onClick={resetForm}><X size={16} /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Nome do produto" value={name} onChange={e => setName(e.target.value)} className="bg-background border-border" />
            <Input placeholder="Preço (ex: 29.90)" value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" className="bg-background border-border" />
          </div>
          <Input placeholder="URL da imagem" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="bg-background border-border" />
          <Textarea placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} className="bg-background border-border" rows={2} />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Modelos compatíveis:</p>
            <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg p-3 bg-background">
              {brands.map(brand => {
                const brandModels = models.filter(m => m.brand_id === brand.id);
                if (brandModels.length === 0) return null;
                return (
                  <div key={brand.id} className="mb-2">
                    <p className="text-xs font-bold text-foreground mb-1">{brand.name}</p>
                    <div className="flex flex-wrap gap-2 pl-2">
                      {brandModels.map(m => (
                        <label key={m.id} className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox checked={selectedModels.includes(m.id)} onCheckedChange={() => toggleModel(m.id)} />
                          <span className="text-xs text-foreground">{m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              {models.length === 0 && <p className="text-xs text-muted-foreground">Cadastre marcas e modelos primeiro.</p>}
            </div>
          </div>

          <Button variant="hero" onClick={submit} disabled={submitting || !name.trim() || !price} className="w-full">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : editingId ? "Salvar Alterações" : "Criar Produto"}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado.</p>
        ) : products.map(p => {
          const pms = getProductModels(p.id);
          return (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-foreground font-medium text-sm">{p.name}</p>
                    <p className="text-primary font-bold text-sm">R$ {Number(p.price).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(p)}><Edit2 size={14} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p.id, p.name)}><Trash2 size={14} className="text-destructive" /></Button>
                  </div>
                </div>
                {p.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{p.description}</p>}
                {pms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pms.slice(0, 5).map(pm => {
                      const model = models.find(m => m.id === pm.model_id);
                      return model ? (
                        <span key={pm.model_id} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {brandName(model.brand_id)} {model.name}
                        </span>
                      ) : null;
                    })}
                    {pms.length > 5 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{pms.length - 5}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoreProducts;
