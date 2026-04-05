import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

type Model = { id: string; name: string; brand_id: string };
type Brand = { id: string; name: string };
type Part = {
  id: string;
  name: string;
  model_id: string;
  quantity: number;
  min_quantity: number;
  price: number;
};

const StoreInventory = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [minQuantity, setMinQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: p }, { data: b }, { data: m }] = await Promise.all([
      supabase.from("parts").select("*").order("name"),
      supabase.from("brands").select("id, name").order("name"),
      supabase.from("models").select("id, name, brand_id").order("name"),
    ]);
    setParts((p as Part[]) ?? []);
    setBrands(b ?? []);
    setModels(m ?? []);
    setLoading(false);
  };

  const filteredModels = selectedBrand
    ? models.filter((m) => m.brand_id === selectedBrand)
    : [];

  const addPart = async () => {
    if (!name.trim() || !selectedModel) return;
    setAdding(true);
    const { error } = await supabase.from("parts").insert({
      name: name.trim(),
      model_id: selectedModel,
      quantity: parseInt(quantity) || 0,
      min_quantity: parseInt(minQuantity) || 1,
      price: parseFloat(price) || 0,
    });
    if (error) toast.error("Erro ao adicionar peça.");
    else {
      toast.success("Peça adicionada!");
      setName("");
      setQuantity("0");
      setMinQuantity("1");
      setPrice("0");
      setSelectedModel("");
      fetchAll();
    }
    setAdding(false);
  };

  const updateQuantity = async (id: string) => {
    const newQty = parseInt(editQty);
    if (isNaN(newQty) || newQty < 0) return;
    const { error } = await supabase
      .from("parts")
      .update({ quantity: newQty })
      .eq("id", id);
    if (error) toast.error("Erro ao atualizar.");
    else {
      toast.success("Estoque atualizado!");
      setEditingId(null);
      fetchAll();
    }
  };

  const deletePart = async (id: string) => {
    if (!confirm("Remover esta peça do estoque?")) return;
    const { error } = await supabase.from("parts").delete().eq("id", id);
    if (error) toast.error("Erro ao remover.");
    else {
      toast.success("Peça removida.");
      fetchAll();
    }
  };

  const getModelName = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return "—";
    const brand = brands.find((b) => b.id === model.brand_id);
    return `${brand?.name ?? ""} ${model.name}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const lowStockParts = parts.filter((p) => p.quantity <= p.min_quantity);

  return (
    <div className="space-y-6">
      {/* Low stock alert */}
      {lowStockParts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-destructive font-heading font-bold text-sm mb-2">
            <AlertTriangle size={16} />
            Peças com estoque baixo ({lowStockParts.length})
          </div>
          <div className="space-y-1">
            {lowStockParts.map((p) => (
              <p key={p.id} className="text-sm text-destructive/80">
                • {p.name} ({getModelName(p.model_id)}) — {p.quantity} un. (mín: {p.min_quantity})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-heading font-bold text-foreground">Adicionar Peça</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Nome da peça"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border"
          />
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
            }}
            className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
          >
            <option value="">Selecione a marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground disabled:opacity-50"
          >
            <option value="">Selecione o modelo</option>
            {filteredModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Quantidade"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="bg-background border-border"
            min="0"
          />
          <Input
            type="number"
            placeholder="Qtd mínima"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            className="bg-background border-border"
            min="0"
          />
          <Input
            type="number"
            placeholder="Preço (R$)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-background border-border"
            min="0"
            step="0.01"
          />
        </div>
        <Button variant="hero" size="sm" onClick={addPart} disabled={adding || !name.trim() || !selectedModel}>
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Adicionar
        </Button>
      </div>

      {/* Parts list */}
      <div className="space-y-2">
        {parts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma peça cadastrada.</p>
        ) : (
          parts.map((part) => {
            const isLow = part.quantity <= part.min_quantity;
            return (
              <div
                key={part.id}
                className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-3 ${
                  isLow ? "border-destructive/40" : "border-border"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-heading font-bold text-sm truncate">{part.name}</p>
                    {isLow ? (
                      <AlertTriangle size={14} className="text-destructive flex-shrink-0" />
                    ) : (
                      <CheckCircle size={14} className="text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">{getModelName(part.model_id)}</p>
                  <p className="text-muted-foreground text-xs">R$ {Number(part.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === part.id ? (
                    <>
                      <Input
                        type="number"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className="w-20 bg-background border-border text-sm"
                        min="0"
                      />
                      <Button variant="hero" size="sm" onClick={() => updateQuantity(part.id)}>
                        Salvar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-sm font-bold cursor-pointer px-2 py-1 rounded ${
                          isLow ? "text-destructive bg-destructive/10" : "text-foreground bg-secondary"
                        }`}
                        onClick={() => {
                          setEditingId(part.id);
                          setEditQty(String(part.quantity));
                        }}
                        title="Clique para editar"
                      >
                        {part.quantity} un.
                      </span>
                      <Button variant="destructive" size="sm" onClick={() => deletePart(part.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StoreInventory;
