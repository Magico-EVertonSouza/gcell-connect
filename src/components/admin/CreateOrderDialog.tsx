import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface CreateOrderDialogProps {
  clients: Profile[];
  onCreated: () => void;
}

const CreateOrderDialog = ({ clients, onCreated }: CreateOrderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    device: "",
    problem: "",
    estimatedDate: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({ userId: "", device: "", problem: "", estimatedDate: "", notes: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const device = form.device.trim();
    const problem = form.problem.trim();

    if (!form.userId || !device || !problem) {
      toast.error("Preencha cliente, dispositivo e problema.");
      return;
    }

    if (device.length > 200 || problem.length > 1000) {
      toast.error("Texto muito longo.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("service_orders")
      .insert({
        user_id: form.userId,
        device,
        problem,
        order_number: "TEMP",
        estimated_date: form.estimatedDate || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar ordem de serviço.");
    } else {
      toast.success(`OS ${data.order_number} criada com sucesso!`);
      resetForm();
      setOpen(false);
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm">
          <Plus size={14} />
          Nova OS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Criar Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select value={form.userId} onValueChange={(v) => setForm(f => ({ ...f, userId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {c.full_name} {c.phone ? `— ${c.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dispositivo *</Label>
            <Input
              placeholder="Ex: iPhone 15 Pro Max"
              value={form.device}
              onChange={e => setForm(f => ({ ...f, device: e.target.value }))}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Problema *</Label>
            <Textarea
              placeholder="Descreva o problema do aparelho..."
              value={form.problem}
              onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Previsão de entrega</Label>
            <Input
              type="date"
              value={form.estimatedDate}
              onChange={e => setForm(f => ({ ...f, estimatedDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Notas adicionais (opcional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              maxLength={500}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Criar OS
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;
