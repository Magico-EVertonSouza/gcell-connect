import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Package, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Brand = { id: string; name: string };
type Model = { id: string; name: string; brand_id: string };
type Product = { id: string; name: string; price: number; image_url: string | null; description: string | null };

const ClientStore = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: b }, { data: m }] = await Promise.all([
        supabase.from("brands").select("id, name").order("name"),
        supabase.from("models").select("id, name, brand_id").order("name"),
      ]);
      setBrands(b ?? []);
      setModels(m ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const selectModel = async (model: Model) => {
    setSelectedModel(model);
    setLoading(true);
    const { data: pm } = await supabase.from("product_models").select("product_id").eq("model_id", model.id);
    const ids = pm?.map((r) => r.product_id) ?? [];
    if (ids.length > 0) {
      const { data: prods } = await supabase.from("products").select("id, name, price, image_url, description").in("id", ids);
      setProducts(prods ?? []);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  const goBack = () => {
    if (selectedModel) {
      setSelectedModel(null);
      setProducts([]);
    } else if (selectedBrand) {
      setSelectedBrand(null);
    }
  };

  const brandModels = selectedBrand ? models.filter((m) => m.brand_id === selectedBrand.id) : [];

  if (loading && !selectedBrand) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className={!selectedBrand ? "text-foreground font-medium" : "hover:text-primary transition-colors cursor-pointer"}
          onClick={() => { setSelectedBrand(null); setSelectedModel(null); setProducts([]); }}
        >
          Loja
        </span>
        {selectedBrand && (
          <>
            <ChevronRight size={14} />
            <span
              className={!selectedModel ? "text-foreground font-medium" : "hover:text-primary transition-colors cursor-pointer"}
              onClick={() => { setSelectedModel(null); setProducts([]); }}
            >
              {selectedBrand.name}
            </span>
          </>
        )}
        {selectedModel && (
          <>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{selectedModel.name}</span>
          </>
        )}
      </div>

      {(selectedBrand || selectedModel) && (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={goBack}>
          <ArrowLeft size={14} /> Voltar
        </Button>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : !selectedBrand ? (
        <div>
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">Loja de Acessórios</h3>
          <p className="text-muted-foreground text-sm mb-6">Selecione a marca do seu aparelho</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {brands.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">Nenhuma marca disponível.</p>
            ) : (
              brands.map((brand) => (
                <motion.button
                  key={brand.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedBrand(brand)}
                  className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors group"
                >
                  <p className="text-foreground font-heading font-bold text-sm group-hover:text-primary transition-colors">
                    {brand.name}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {models.filter((m) => m.brand_id === brand.id).length} modelos
                  </p>
                </motion.button>
              ))
            )}
          </div>
        </div>
      ) : !selectedModel ? (
        <div>
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">{selectedBrand.name}</h3>
          <p className="text-muted-foreground text-sm mb-6">Selecione o modelo</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {brandModels.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">Nenhum modelo disponível.</p>
            ) : (
              brandModels.map((model) => (
                <motion.button
                  key={model.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => selectModel(model)}
                  className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors group"
                >
                  <p className="text-foreground font-heading font-bold text-sm group-hover:text-primary transition-colors">
                    {model.name}
                  </p>
                </motion.button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">
            Acessórios para {selectedBrand.name} {selectedModel.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">{products.length} produto(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">Nenhum produto disponível.</p>
            ) : (
              products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors group"
                >
                  {product.image_url ? (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-secondary flex items-center justify-center">
                      <Package size={40} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-foreground font-heading font-bold text-sm line-clamp-2">{product.name}</h4>
                    {product.description && (
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <p className="text-primary font-bold text-lg mt-2">R$ {Number(product.price).toFixed(2)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientStore;
