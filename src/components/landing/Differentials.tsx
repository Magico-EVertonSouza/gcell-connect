import { motion } from "framer-motion";
import { Zap, Users, ShieldCheck, Star } from "lucide-react";

const diffs = [
  { icon: Zap, title: "Atendimento Rápido", desc: "Agilidade no diagnóstico e no conserto do seu aparelho." },
  { icon: Users, title: "Técnicos Especializados", desc: "Equipe qualificada com anos de experiência." },
  { icon: ShieldCheck, title: "Garantia", desc: "Todos os serviços com garantia de qualidade." },
  { icon: Star, title: "Peças de Qualidade", desc: "Utilizamos peças originais e de alta qualidade." },
];

const Differentials = () => {
  return (
    <section id="diferenciais" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Por que escolher a <span className="gradient-text">GCell</span>?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {diffs.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <d.icon size={28} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">{d.title}</h3>
              <p className="text-muted-foreground text-sm">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentials;
