import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const statusMap: Record<string, { label: string; color: string }> = {
  received: { label: "Recebido", color: "bg-blue-500" },
  analysis: { label: "Em Análise", color: "bg-yellow-500" },
  waiting: { label: "Aguardando Aprovação", color: "bg-orange-500" },
  repairing: { label: "Em Conserto", color: "bg-yellow-400" },
  done: { label: "Finalizado", color: "bg-primary" },
  ready: { label: "Pronto para Retirada", color: "bg-primary" },
};

const steps = ["received", "analysis", "waiting", "repairing", "done", "ready"];

const TrackRepair = () => {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Tables<"service_orders"> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSearching(true);
    setNotFound(false);

    // Public lookup - uses order_number. RLS requires auth, so we search without auth filter
    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .eq("order_number", code.trim().toUpperCase())
      .maybeSingle();

    if (data) {
      setOrder(data);
    } else {
      setOrder(null);
      setNotFound(true);
    }
    setSearching(false);
  };

  const currentStepIndex = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-background circuit-pattern px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} />
          <span className="text-sm">Voltar ao site</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Acompanhar <span className="gradient-text">Reparo</span>
          </h1>
          <p className="text-muted-foreground mb-8">Digite o código da sua ordem de serviço</p>

          <form onSubmit={handleSearch} className="flex gap-3 mb-10">
            <Input
              placeholder="Ex: OS-2026-0001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-card border-border"
            />
            <Button variant="hero" type="submit" disabled={searching}>
              <Search size={16} />
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </form>

          {notFound && (
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada com esse código.</p>
            </div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Ordem de Serviço</p>
                  <p className="font-heading font-bold text-foreground text-lg">{order.order_number}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusMap[order.status].color} text-primary-foreground`}>
                  {statusMap[order.status].label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div>
                  <p className="text-muted-foreground">Aparelho</p>
                  <p className="text-foreground font-medium">{order.device}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Problema</p>
                  <p className="text-foreground font-medium">{order.problem}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de Entrada</p>
                  <p className="text-foreground font-medium">{format(new Date(order.entry_date), "dd/MM/yyyy")}</p>
                </div>
                {order.estimated_date && (
                  <div>
                    <p className="text-muted-foreground">Previsão</p>
                    <p className="text-foreground font-medium">{format(new Date(order.estimated_date), "dd/MM/yyyy")}</p>
                  </div>
                )}
              </div>

              {/* Status timeline */}
              <div className="space-y-3">
                <p className="text-sm font-heading font-bold text-foreground mb-4">Progresso</p>
                {steps.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${isCompleted ? "bg-primary" : "bg-muted"} ${isCurrent ? "animate-pulse-glow ring-2 ring-primary/30" : ""}`} />
                      <span className={`text-sm ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {statusMap[step].label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrackRepair;
