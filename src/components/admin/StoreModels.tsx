import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Edit2, Check, X } from "lucide-react";

type Brand = { id: string; name: string };
type Model = { id: string; name: string; brand_id: string };

const StoreModels = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchAll = async () => {
    const [{ data: b }, { data: m }] = await Promise.all([
      supabase.from("brands").select("id, name").order("name"),
      supabase.from("models").select("id, name, brand_id").order("name"),
    ]);
    setBrands(b ?? []);
    setModels(m ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = selectedBrand ? models.filter(m => m.brand_id === selectedBrand) : models;
  const brandName = (id: string) => brands.find(b => b.id === id)?.name ?? "";

  const add = async () => {
    if (!newName.trim() || !selectedBrand) return;
    setAdding(true);
    const { error } = await supabase.from("models").insert({ name: newName.trim(), brand_id: selectedBrand });
    if (error) toast.error(error.code === "23505" ? "Modelo já existe nessa marca." : "Erro ao criar modelo.");
    else { toast.success("Modelo criado!"); setNewName(""); fetchAll(); }
    setAdding(false);
  };

  const update = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase.from("models").update({ name: editName.trim() }).eq("id", id);
    if (error) toast.error("Erro ao atualizar.");
    else { toast.success("Modelo atualizado!"); setEditId(null); fetchAll(); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remover modelo "${name}"?`)) return;
    const { error } = await supabase.from("models").delete().eq("id", id);
    if (error) toast.error("Erro ao remover.");
    else { toast.success("Modelo removido!"); fetchAll(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="bg-background border-border sm:w-48">
            <SelectValue placeholder="Selecione a marca" />
          </SelectTrigger>
          <SelectContent>
            {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Nome do modelo" value={newName} onChange={e => setNewName(e.target.value)} className="bg-background border-border" onKeyDown={e => e.key === "Enter" && add()} />
        <Button variant="hero" onClick={add} disabled={adding || !newName.trim() || !selectedBrand}>
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {selectedBrand ? "Nenhum modelo nesta marca." : "Selecione uma marca ou cadastre modelos."}
          </p>
        ) : filtered.map(m => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            {editId === m.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-background border-border" onKeyDown={e => e.key === "Enter" && update(m.id)} />
                <Button size="icon" variant="ghost" onClick={() => update(m.id)}><Check size={14} className="text-primary" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEditId(null)}><X size={14} /></Button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-foreground font-medium text-sm">{m.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">({brandName(m.brand_id)})</span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditId(m.id); setEditName(m.name); }}><Edit2 size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(m.id, m.name)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreModels;
