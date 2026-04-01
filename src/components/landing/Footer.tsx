import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Laboratório GCell" className="h-20 md:h-24 lg:h-18" />
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
