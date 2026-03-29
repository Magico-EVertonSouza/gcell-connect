import { motion } from "framer-motion";
import { Send, Search, CheckCircle, Eye, Bell } from "lucide-react";

const steps = [
  { icon: Send, title: "Solicite", desc: "Envie sua solicitação pelo site ou WhatsApp" },
  { icon: Search, title: "Diagnóstico", desc: "Avaliamos seu aparelho e enviamos o orçamento" },
  { icon: CheckCircle, title: "Aprovação", desc: "Aprove o orçamento diretamente pelo sistema" },
  { icon: Eye, title: "Acompanhe", desc: "Veja o status do conserto em tempo real" },
  { icon: Bell, title: "Conclusão", desc: "Receba aviso quando estiver pronto para retirada" },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 relative">
      <div className="absolute inset-0 circuit-pattern opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Como <span className="gradient-text">Funciona</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Um processo simples, rápido e transparente
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-6 mb-8 last:mb-0"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <step.icon size={20} className="text-primary" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-12 bg-gradient-to-b from-primary/30 to-transparent mt-2" />
                )}
              </div>
              <div className="pt-2">
                <h3 className="font-heading font-bold text-foreground mb-1">
                  <span className="text-primary mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
