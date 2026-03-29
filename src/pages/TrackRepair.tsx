import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";

const statusMap: Record<string, { label: string; color: string }> = {
  received: { label: "Recebido", color: "bg-blue-500" },
  analysis: { label: "Em Análise", color: "bg-yellow-500" },
  waiting: { label: "Aguardando Aprovação", color: "bg-orange-500" },
  repairing: { label: "Em Conserto", color: "bg-yellow-400" },
  done: { label: "Finalizado", color: "bg-primary" },
  ready: { label: "Pronto para Retirada", color: "bg-primary" },
};

const mockOrder = {
  id: "OS-2024-0042",
  device: "iPhone 13 Pro",
  problem: "Tela trincada e bateria fraca",
  status: "repairing",
  date: "2024-03-15",
  estimate: "2024-03-18",
  steps: ["received", "analysis", "waiting", "repairing", "done", "ready"],
};

const TrackRepair = () => {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<typeof mockOrder | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock - shows demo data
    setOrder(mockOrder);
  };

  const currentStepIndex = order ? order.steps.indexOf(order.status) : -1;

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
              placeholder="Ex: OS-2024-0042"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-card border-border"
            />
            <Button variant="hero" type="submit">
              <Search size={16} />
              Buscar
            </Button>
          </form>

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Ordem de Serviço</p>
                  <p className="font-heading font-bold text-foreground text-lg">{order.id}</p>
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
                  <p className="text-foreground font-medium">{order.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Previsão</p>
                  <p className="text-foreground font-medium">{order.estimate}</p>
                </div>
              </div>

              {/* Status timeline */}
              <div className="space-y-3">
                <p className="text-sm font-heading font-bold text-foreground mb-4">Progresso</p>
                {order.steps.map((step, i) => {
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
