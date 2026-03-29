import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-black text-sm">G</span>
            </div>
            <span className="font-heading font-bold text-foreground">Laboratório GCell</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
            <a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a>
            <Link to="/login" className="hover:text-primary transition-colors">Área do Cliente</Link>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2024 Laboratório GCell. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
