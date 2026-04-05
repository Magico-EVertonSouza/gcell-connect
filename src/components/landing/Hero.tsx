import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden circuit-pattern pt-16">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          {/* Logo central */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/logo.png"
              alt="Laboratório GGCell"
              className="h-64 md:h-72 lg:h-80"
            />
          </motion.div>

          {/* Botões de ação */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full"
          >
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="text-base px-8 py-6 w-full">
                Solicitar Serviço
                <ChevronRight size={18} />
              </Button>
            </Link>
            <Link to="/loja" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6 w-full">
                Loja de Acessórios
                <ChevronRight size={18} />
              </Button>
            </Link>
            <Link to="/acompanhar" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="text-base px-8 py-6 w-full">
                Acompanhar Reparo
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
