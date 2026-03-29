import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Plus, Clock, CheckCircle, Wrench, Eye, LogOut,
  Smartphone, CalendarDays, FileText
} from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  received: "bg-blue-500",
  analysis: "bg-yellow-500",
  waiting: "bg-orange-500",
  repairing: "bg-yellow-400",
  done: "bg-primary",
  ready: "bg-primary",
};

const statusLabels: Record<string, string> = {
  received: "Recebido",
  analysis: "Em Análise",
  waiting: "Aguardando Aprovação",
  repairing: "Em Conserto",
  done: "Finalizado",
  ready: "Pronto para Retirada",
};

const mockOrders = [
  { id: "OS-2024-0042", device: "iPhone 13 Pro", problem: "Tela trincada", status: "repairing", date: "2024-03-15", estimate: "2024-03-18" },
  { id: "OS-2024-0038", device: "Samsung S23", problem: "Não carrega", status: "ready", date: "2024-03-10", estimate: "2024-03-14" },
  { id: "OS-2024-0031", device: "Xiaomi 12", problem: "Placa danificada", status: "done", date: "2024-02-20", estimate: "2024-02-25" },
];

const ClientDashboard = () => {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [tab, setTab] = useState<"orders" | "schedule">("orders");

  const handleNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Solicitação enviada! Entraremos em contato para o diagnóstico.");
    setShowNewOrder(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-black text-sm">G</span>
            </div>
            <span className="font-heading font-bold text-foreground">GCell</span>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <LogOut size={16} />
              Sair
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Olá, Cliente!</h1>
              <p className="text-muted-foreground text-sm">Gerencie seus serviços e agendamentos</p>
            </div>
            <Button variant="hero" onClick={() => setShowNewOrder(true)}>
              <Plus size={16} />
              Novo Serviço
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-card rounded-xl p-1 border border-border w-fit">
            <button
              onClick={() => setTab("orders")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FileText size={14} className="inline mr-2" />
              Meus Serviços
            </button>
            <button
              onClick={() => setTab("schedule")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "schedule" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <CalendarDays size={14} className="inline mr-2" />
              Agendamentos
            </button>
          </div>

          {tab === "orders" && (
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Smartphone size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-foreground text-sm">{order.id}</p>
                        <p className="text-muted-foreground text-xs">{order.device} — {order.problem}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]} text-primary-foreground`}>
                      {statusLabels[order.status]}
                    </div>
                  </div>
                  <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={12} /> Entrada: {order.date}</span>
                    <span className="flex items-center gap-1"><CheckCircle size={12} /> Previsão: {order.estimate}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "schedule" && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <CalendarDays size={48} className="text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Sistema de agendamento será ativado com o backend.</p>
              <p className="text-muted-foreground text-sm mt-1">Em breve você poderá agendar atendimentos diretamente por aqui.</p>
            </div>
          )}
        </motion.div>

        {/* New order modal */}
        {showNewOrder && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-heading font-bold text-foreground mb-4">Solicitar Serviço</h2>
              <form onSubmit={handleNewOrder} className="space-y-4">
                <Input placeholder="Aparelho (ex: iPhone 13)" className="bg-background border-border" required />
                <Textarea placeholder="Descreva o problema" className="bg-background border-border" rows={3} required />
                <div className="flex gap-3">
                  <Button variant="hero" type="submit" className="flex-1">
                    <Wrench size={16} />
                    Enviar Solicitação
                  </Button>
                  <Button variant="outline" type="button" onClick={() => setShowNewOrder(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
