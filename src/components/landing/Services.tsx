import { motion } from "framer-motion";
import { Smartphone, Cpu, Wrench, Code, Search } from "lucide-react";

const services = [
  { icon: Smartphone, title: "Troca de Tela", desc: "Substituição de telas originais e compatíveis com garantia." },
  { icon: Cpu, title: "Reparo de Placa", desc: "Microsoldagem e reparo avançado de placas-mãe." },
  { icon: Wrench, title: "Manutenção Geral", desc: "Troca de baterias, conectores, botões e mais." },
  { icon: Code, title: "Software", desc: "Atualização, desbloqueio e recuperação de sistemas." },
  { icon: Search, title: "Diagnóstico Técnico", desc: "Avaliação completa e orçamento sem compromisso." },
];

const Services = () => {
  return (
    <section id="servicos" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Nossos <span className="gradient-text">Serviços</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Soluções completas para celulares e eletrônicos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_hsl(82_100%_50%/0.1)]"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <s.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
