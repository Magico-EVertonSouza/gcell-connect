import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Edit2, Check, X } from "lucide-react";

type Brand = { id: string; name: string };

const StoreBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetch = async () => {
    const { data } = await supabase.from("brands").select("id, name").order("name");
    setBrands(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const add = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("brands").insert({ name: newName.trim() });
    if (error) toast.error(error.code === "23505" ? "Marca já existe." : "Erro ao criar marca.");
    else { toast.success("Marca criada!"); setNewName(""); fetch(); }
    setAdding(false);
  };

  const update = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase.from("brands").update({ name: editName.trim() }).eq("id", id);
    if (error) toast.error("Erro ao atualizar.");
    else { toast.success("Marca atualizada!"); setEditId(null); fetch(); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remover marca "${name}"? Todos os modelos vinculados serão excluídos.`)) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) toast.error("Erro ao remover.");
    else { toast.success("Marca removida!"); fetch(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Nome da marca" value={newName} onChange={e => setNewName(e.target.value)} className="bg-background border-border" onKeyDown={e => e.key === "Enter" && add()} />
        <Button variant="hero" onClick={add} disabled={adding || !newName.trim()}>
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {brands.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma marca cadastrada.</p>
        ) : brands.map(b => (
          <div key={b.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            {editId === b.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-background border-border" onKeyDown={e => e.key === "Enter" && update(b.id)} />
                <Button size="icon" variant="ghost" onClick={() => update(b.id)}><Check size={14} className="text-primary" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEditId(null)}><X size={14} /></Button>
              </div>
            ) : (
              <>
                <span className="text-foreground font-medium text-sm">{b.name}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditId(b.id); setEditName(b.name); }}><Edit2 size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(b.id, b.name)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreBrands;
