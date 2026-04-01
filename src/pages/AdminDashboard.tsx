import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  LogOut, Users, FileText, CalendarDays, Search,
  Loader2, Smartphone, Clock, ChevronDown, RefreshCw,
  Plus, XCircle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables, Enums } from "@/integrations/supabase/types";
import CreateOrderDialog from "@/components/admin/CreateOrderDialog";

const statusLabels: Record<string, string> = {
  received: "Recebido",
  analysis: "Em Análise",
  waiting: "Aguardando",
  repairing: "Em Conserto",
  done: "Finalizado",
  ready: "Pronto",
};

const statusColors: Record<string, string> = {
  received: "bg-blue-500",
  analysis: "bg-yellow-500",
  waiting: "bg-orange-500",
  repairing: "bg-amber-500",
  done: "bg-primary",
  ready: "bg-emerald-500",
};

const allStatuses: Enums<"service_status">[] = [
  "received", "analysis", "waiting", "repairing", "done", "ready"
];

type Profile = Tables<"profiles">;
type ServiceOrder = Tables<"service_orders">;
type Appointment = Tables<"appointments">;

type ProfileMap = Record<string, Profile>;

const AdminDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"orders" | "clients" | "schedule">("orders");
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [profileMap, setProfileMap] = useState<ProfileMap>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoadingData(true);
    const [ordersRes, clientsRes, apptsRes] = await Promise.all([
      supabase.from("service_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("appointment_date", { ascending: true }),
    ]);
    setOrders(ordersRes.data ?? []);
    const profs = clientsRes.data ?? [];
    setClients(profs);
    const map: ProfileMap = {};
    profs.forEach(p => { map[p.user_id] = p; });
    setProfileMap(map);
    setAppointments(apptsRes.data ?? []);
    setLoadingData(false);
  };

  const updateStatus = async (orderId: string, newStatus: Enums<"service_status">) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("service_orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      toast.success(`Status atualizado para "${statusLabels[newStatus]}"`);
      fetchAll();
    }
    setUpdatingId(null);
  };

  const confirmAppointment = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ confirmed: true })
      .eq("id", id);
    if (error) toast.error("Erro ao confirmar.");
    else {
      toast.success("Agendamento confirmado!");
      fetchAll();
    }
  };

  const rejectAppointment = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id);
    if (error) toast.error("Erro ao recusar agendamento.");
    else {
      toast.success("Agendamento recusado e removido.");
      fetchAll();
    }
  };

  const generateOrderFromAppointment = async (appt: Appointment) => {
    setUpdatingId(appt.id);
    const { data, error } = await supabase
      .from("service_orders")
      .insert({
        user_id: appt.user_id,
        device: appt.device,
        problem: appt.description || "Conforme agendamento",
        order_number: "TEMP", // trigger will generate
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao gerar ordem de serviço.");
    } else {
      toast.success(`OS ${data.order_number} gerada com sucesso!`);
      fetchAll();
    }
    setUpdatingId(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || adminLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);

  const filteredOrders = orders.filter(o =>
    !search ||
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.device.toLowerCase().includes(search.toLowerCase()) ||
    o.problem.toLowerCase().includes(search.toLowerCase())
  );

  const filteredClients = clients.filter(c =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  );

  const tabs = [
    { key: "orders" as const, label: "Ordens de Serviço", icon: FileText, count: orders.length },
    { key: "clients" as const, label: "Clientes", icon: Users, count: clients.length },
    { key: "schedule" as const, label: "Agenda", icon: CalendarDays, count: todayAppointments.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-black text-sm">G</span>
            </div>
            <div>
              <span className="font-heading font-bold text-foreground">GCell</span>
              <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 text-[10px]">Admin</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total OS", value: orders.length, icon: FileText },
            { label: "Em andamento", value: orders.filter(o => !["done", "ready"].includes(o.status)).length, icon: Smartphone },
            { label: "Clientes", value: clients.length, icon: Users },
            { label: "Agenda hoje", value: todayAppointments.length, icon: CalendarDays },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <stat.icon size={14} />
                {stat.label}
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 bg-card rounded-xl p-1 border border-border">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSearch(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="text-xs opacity-70">({t.count})</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchAll}>
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : (
          <>
            {/* ORDERS TAB */}
            {tab === "orders" && (
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Nenhuma ordem encontrada.</p>
                ) : filteredOrders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Smartphone size={18} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-bold text-foreground text-sm">{order.order_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[order.status]} text-primary-foreground`}>
                              {statusLabels[order.status]}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs truncate">{order.device} — {order.problem}</p>
                          {profileMap[order.user_id] && (
                            <p className="text-muted-foreground text-xs mt-0.5">
                              Cliente: {profileMap[order.user_id].full_name} {profileMap[order.user_id].phone && `| ${profileMap[order.user_id].phone}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value as Enums<"service_status">)}
                            disabled={updatingId === order.id}
                            className="appearance-none bg-secondary text-secondary-foreground border border-border rounded-lg px-3 py-1.5 pr-8 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {allStatuses.map(s => (
                              <option key={s} value={s}>{statusLabels[s]}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {format(new Date(order.entry_date), "dd/MM/yyyy")}
                      </span>
                      {order.estimated_date && (
                        <span className="flex items-center gap-1">
                          Previsão: {format(new Date(order.estimated_date), "dd/MM/yyyy")}
                        </span>
                      )}
                      {order.notes && <span>Obs: {order.notes}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CLIENTS TAB */}
            {tab === "clients" && (
              <div className="space-y-3">
                {filteredClients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Nenhum cliente encontrado.</p>
                ) : filteredClients.map(client => {
                  const clientOrders = orders.filter(o => o.user_id === client.user_id);
                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users size={18} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-foreground text-sm">{client.full_name}</p>
                            <p className="text-muted-foreground text-xs">{client.phone || "Sem telefone"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-foreground font-bold text-sm">{clientOrders.length}</p>
                          <p className="text-muted-foreground text-xs">ordens</p>
                        </div>
                      </div>
                      {clientOrders.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {clientOrders.slice(0, 3).map(o => (
                            <span key={o.id} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                              {o.order_number} • {statusLabels[o.status]}
                            </span>
                          ))}
                          {clientOrders.length > 3 && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">
                              +{clientOrders.length - 3} mais
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* SCHEDULE TAB */}
            {tab === "schedule" && (
              <div className="space-y-6">
                {/* Today */}
                <div>
                  <h3 className="text-sm font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                    <CalendarDays size={14} className="text-primary" />
                    Agenda de Hoje — {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                  {todayAppointments.length === 0 ? (
                    <p className="text-muted-foreground text-sm bg-card border border-border rounded-xl p-6 text-center">
                      Nenhum agendamento para hoje.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {todayAppointments.map(appt => (
                        <motion.div
                          key={appt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card border border-border rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                                <span className="text-primary font-heading font-bold text-sm">{appt.appointment_time.slice(0, 5)}</span>
                              </div>
                              <div>
                                <p className="text-foreground font-medium text-sm">{appt.device}</p>
                                {profileMap[appt.user_id] && (
                                  <p className="text-muted-foreground text-xs">{profileMap[appt.user_id].full_name}</p>
                                )}
                                {appt.description && <p className="text-muted-foreground text-xs mt-0.5">{appt.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!appt.confirmed ? (
                                <>
                                  <Button variant="hero" size="sm" onClick={() => confirmAppointment(appt.id)}>
                                    <CheckCircle size={14} /> Confirmar
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => rejectAppointment(appt.id)}>
                                    <XCircle size={14} /> Recusar
                                  </Button>
                                </>
                              ) : (
                                <Badge className="bg-primary/20 text-primary border-primary/30">Confirmado</Badge>
                              )}
                            </div>
                          </div>
                          {appt.confirmed && (
                            <div className="mt-3 pt-3 border-t border-border flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updatingId === appt.id}
                                onClick={() => generateOrderFromAppointment(appt)}
                              >
                                {updatingId === appt.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                Gerar OS
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* All appointments */}
                <div>
                  <h3 className="text-sm font-heading font-bold text-foreground mb-3">Todos os Agendamentos</h3>
                  {appointments.length === 0 ? (
                    <p className="text-muted-foreground text-sm bg-card border border-border rounded-xl p-6 text-center">
                      Nenhum agendamento registrado.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {appointments.map(appt => (
                        <div key={appt.id} className="bg-card border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-foreground font-medium text-sm">{appt.device}</p>
                              <p className="text-muted-foreground text-xs">
                                {format(new Date(appt.appointment_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })} às {appt.appointment_time.slice(0, 5)}
                                {profileMap[appt.user_id] && ` — ${profileMap[appt.user_id].full_name}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!appt.confirmed ? (
                                <>
                                  <Button variant="hero" size="sm" onClick={() => confirmAppointment(appt.id)}>
                                    <CheckCircle size={14} /> Confirmar
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => rejectAppointment(appt.id)}>
                                    <XCircle size={14} />
                                  </Button>
                                </>
                              ) : (
                                <Badge className="bg-primary/20 text-primary border-primary/30">Confirmado</Badge>
                              )}
                              {appt.confirmed && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={updatingId === appt.id}
                                  onClick={() => generateOrderFromAppointment(appt)}
                                >
                                  {updatingId === appt.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                  Gerar OS
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
