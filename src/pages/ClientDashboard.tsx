import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Plus, Clock, CheckCircle, Wrench, LogOut,
  Smartphone, CalendarDays, FileText, Loader2, ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import ClientStore from "@/components/client/ClientStore";

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

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

const ClientDashboard = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [tab, setTab] = useState<"orders" | "schedule" | "store">("orders");
  const [orders, setOrders] = useState<Tables<"service_orders">[]>([]);
  const [appointments, setAppointments] = useState<Tables<"appointments">[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [device, setDevice] = useState("");
  const [problem, setProblem] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationOS, setConfirmationOS] = useState<string | null>(null);
  const [confirmationAppt, setConfirmationAppt] = useState<{ date: string; time: string; device: string } | null>(null);

  // Schedule state
  const [schedDate, setSchedDate] = useState<Date | undefined>();
  const [schedTime, setSchedTime] = useState("");
  const [schedDevice, setSchedDevice] = useState("");
  const [schedDesc, setSchedDesc] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile?.phone) setPhone(profile.phone);
  }, [profile]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (schedDate) fetchBookedTimes(schedDate);
  }, [schedDate]);

  const fetchData = async () => {
    setLoadingData(true);
    const [ordersRes, apptRes] = await Promise.all([
      supabase.from("service_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("appointment_date", { ascending: true }),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (apptRes.data) setAppointments(apptRes.data);
    setLoadingData(false);
  };

  const fetchBookedTimes = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const { data } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("appointment_date", dateStr);
    setBookedTimes(data?.map((a) => a.appointment_time.slice(0, 5)) ?? []);
  };

  const handleNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("service_orders").insert({
      user_id: user.id,
      device,
      problem,
    }).select("order_number").single();
    if (error) {
      console.error("Erro ao criar OS:", error);
      toast.error("Erro ao enviar solicitação: " + error.message);
    } else {
      // Save phone to profile
      if (phone) {
        await supabase.from("profiles").update({ phone }).eq("user_id", user.id);
      }
      setDevice("");
      setProblem("");
      setPhone(phone); // keep phone for next time
      setShowNewOrder(false);
      setConfirmationOS(data.order_number);
      fetchData();
    }
    setSubmitting(false);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !schedDate || !schedTime) return;
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      appointment_date: format(schedDate, "yyyy-MM-dd"),
      appointment_time: schedTime,
      device: schedDevice,
      description: schedDesc || null,
    });
    if (error) {
      if (error.code === "23505") {
        toast.error("Este horário já está ocupado. Escolha outro.");
      } else {
        toast.error("Erro ao agendar.");
      }
    } else {
      // Save phone to profile
      if (phone) {
        await supabase.from("profiles").update({ phone }).eq("user_id", user.id);
      }
      setConfirmationAppt({
        date: format(schedDate, "dd/MM/yyyy", { locale: ptBR }),
        time: schedTime,
        device: schedDevice,
      });
      setSchedDate(undefined);
      setSchedTime("");
      setSchedDevice("");
      setSchedDesc("");
      fetchData();
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-20" />
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Olá, {profile?.full_name || "Cliente"}!
              </h1>
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
            <button
              onClick={() => setTab("store")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "store" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ShoppingBag size={14} className="inline mr-2" />
              Loja
            </button>
          </div>

          {tab === "orders" && (
            <div className="space-y-4">
              {loadingData ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Smartphone size={48} className="text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum serviço ainda.</p>
                  <p className="text-muted-foreground text-sm mt-1">Clique em "Novo Serviço" para solicitar.</p>
                </div>
              ) : (
                orders.map((order) => (
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
                          <p className="font-heading font-bold text-foreground text-sm">{order.order_number}</p>
                          <p className="text-muted-foreground text-xs">{order.device} — {order.problem}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]} text-primary-foreground`}>
                        {statusLabels[order.status]}
                      </div>
                    </div>
                    <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Entrada: {format(new Date(order.entry_date), "dd/MM/yyyy")}
                      </span>
                      {order.estimated_date && (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} /> Previsão: {format(new Date(order.estimated_date), "dd/MM/yyyy")}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {tab === "schedule" && (
            <div className="space-y-6">
              {/* Existing appointments */}
              {appointments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-heading font-bold text-foreground">Seus Agendamentos</h3>
                  {appointments.map((appt) => (
                    <div key={appt.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-medium text-sm">{appt.device}</p>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(appt.appointment_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })} às {appt.appointment_time.slice(0, 5)}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${appt.confirmed ? "bg-primary" : "bg-yellow-500"} text-primary-foreground`}>
                        {appt.confirmed ? "Confirmado" : "Pendente"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New appointment form */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold text-foreground mb-4">Agendar Atendimento</h3>
                <form onSubmit={handleSchedule} className="space-y-4">
                  <Input
                    placeholder="Aparelho (ex: iPhone 13)"
                    value={schedDevice}
                    onChange={(e) => setSchedDevice(e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                  <Input
                    placeholder="Telefone para contato (ex: 11 99999-9999)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="tel"
                    className="bg-background border-border"
                  />
                  <Textarea
                    placeholder="Descrição (opcional)"
                    value={schedDesc}
                    onChange={(e) => setSchedDesc(e.target.value)}
                    className="bg-background border-border"
                    rows={2}
                  />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Selecione a data:</p>
                    <Calendar
                      mode="single"
                      selected={schedDate}
                      onSelect={setSchedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="rounded-xl border border-border bg-background"
                      locale={ptBR}
                    />
                  </div>
                  {schedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Horários disponíveis:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {timeSlots.map((time) => {
                          const booked = bookedTimes.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={booked}
                              onClick={() => setSchedTime(time)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                schedTime === time
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : booked
                                  ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                                  : "bg-background text-foreground border-border hover:border-primary/50"
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <Button variant="hero" type="submit" disabled={!schedDate || !schedTime || !schedDevice || submitting} className="w-full">
                    <CalendarDays size={16} />
                    {submitting ? "Agendando..." : "Confirmar Agendamento"}
                  </Button>
                </form>
              </div>
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
                <Input
                  placeholder="Aparelho (ex: iPhone 13)"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="bg-background border-border"
                  required
                />
                <Input
                  placeholder="Telefone para contato (ex: 11 99999-9999)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background border-border"
                  required
                  type="tel"
                />
                <Textarea
                  placeholder="Descreva o problema"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="bg-background border-border"
                  rows={3}
                  required
                />
                <div className="flex gap-3">
                  <Button variant="hero" type="submit" className="flex-1" disabled={submitting}>
                    <Wrench size={16} />
                    {submitting ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
                  <Button variant="outline" type="button" onClick={() => setShowNewOrder(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* OS Confirmation Modal */}
        {confirmationOS && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Solicitação Enviada!</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Sua ordem de serviço foi criada com sucesso. Use o código abaixo para acompanhar o status do seu reparo.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Código da Ordem de Serviço</p>
                <p className="text-2xl font-heading font-black text-primary tracking-wider">{confirmationOS}</p>
              </div>
              <p className="text-muted-foreground text-xs mb-6">
                Acesse <Link to="/acompanhar" className="text-primary underline">Acompanhar Reparo</Link> a qualquer momento para ver o progresso.
              </p>
              <Button variant="hero" className="w-full" onClick={() => setConfirmationOS(null)}>
                Entendi
              </Button>
            </motion.div>
          </div>
        )}

        {/* Appointment Confirmation Modal */}
        {confirmationAppt && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CalendarDays size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Agendamento Confirmado!</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Seu atendimento foi agendado com sucesso. Aguarde a confirmação.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aparelho:</span>
                  <span className="text-foreground font-medium">{confirmationAppt.device}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="text-foreground font-medium">{confirmationAppt.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="text-foreground font-medium">{confirmationAppt.time}</span>
                </div>
              </div>
              <Button variant="hero" className="w-full" onClick={() => setConfirmationAppt(null)}>
                Entendi
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
