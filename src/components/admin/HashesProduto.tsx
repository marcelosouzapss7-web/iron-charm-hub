import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProdutoHash = {
  id: string;
  name: string;
  product_hash: string | null;
  offer_hash: string | null;
  hash_added_at: string | null;
};

/** Busca produtos com os hashes promocionais. */
export async function listarProdutosComHash(): Promise<ProdutoHash[]> {
  const { data, error } = await (supabase as any)
    .from("products")
    .select("id, name, product_hash, offer_hash, hash_added_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProdutoHash[];
}

/** Atualiza product_hash e offer_hash de um produto. */
export async function salvarHashesProduto(
  id: string,
  hashes: { product_hash: string | null; offer_hash: string | null; hash_added_at?: string | null },
) {
  const { error } = await (supabase as any).from("products").update(hashes).eq("id", id);
  if (error) throw error;
}

export function HashesProduto() {
  const qc = useQueryClient();
  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ["products_hashes"],
    queryFn: listarProdutosComHash,
  });
  const [selId, setSelId] = useState("");
  const [productHash, setProductHash] = useState("");
  const [offerHash, setOfferHash] = useState("");
  const [saving, setSaving] = useState(false);
  const sel = produtos.find((p) => p.id === selId);
  const comHash = produtos
    .filter((p) => p.product_hash || p.offer_hash)
    .sort((a, b) => (a.hash_added_at ?? "").localeCompare(b.hash_added_at ?? ""));

  useEffect(() => {
    setProductHash(sel?.product_hash ?? "");
    setOfferHash(sel?.offer_hash ?? "");
  }, [sel?.id, sel?.product_hash, sel?.offer_hash]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!sel) return;
    setSaving(true);
    try {
      const ph = productHash.trim() || null;
      const oh = offerHash.trim() || null;
      const tinha = !!(sel.product_hash || sel.offer_hash);
      const temAgora = !!(ph || oh);
      await salvarHashesProduto(sel.id, {
        product_hash: ph,
        offer_hash: oh,
        hash_added_at: !temAgora ? null : tinha && sel.hash_added_at ? sel.hash_added_at : new Date().toISOString(),
      });
      toast.success("Hashes salvos");
      qc.invalidateQueries({ queryKey: ["products_hashes"] });
    } catch {
      toast.error("Não foi possível salvar os hashes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-extrabold">Promoções</h1>
      <div className="space-y-4 rounded-xl bg-background p-4 shadow-sm">
        <Label htmlFor="produto-hash-select">Produto</Label>
        {error ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os produtos. Verifique se as colunas de hash foram criadas.
          </p>
        ) : (
          <select
            id="produto-hash-select"
            value={selId}
            onChange={(e) => setSelId(e.target.value)}
            disabled={isLoading}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{isLoading ? "Carregando..." : "Selecione um produto"}</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.id.slice(0, 8)}
              </option>
            ))}
          </select>
        )}
      </div>

      {sel && (
        <form onSubmit={salvar} className="space-y-4 rounded-xl bg-background p-4 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="product_hash">product_hash</Label>
            <Input
              id="product_hash"
              value={productHash}
              onChange={(e) => setProductHash(e.target.value)}
              placeholder="Insira o hash do produto"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer_hash">offer_hash</Label>
            <Input
              id="offer_hash"
              value={offerHash}
              onChange={(e) => setOfferHash(e.target.value)}
              placeholder="Insira o hash da oferta para a página Home"
              maxLength={200}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      )}

      <div className="space-y-3 rounded-xl bg-background p-4 shadow-sm">
        <h2 className="text-lg font-extrabold">Produtos com hashes cadastrados</h2>
        {comHash.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto com hash ainda.</p>
        ) : (
          <ul className="divide-y">
            {comHash.map((p, i) => (
              <li key={p.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">{i + 1}. {p.name}</p>
                  <p className="break-all text-muted-foreground">
                    product_hash: {p.product_hash || "—"}
                  </p>
                  <p className="break-all text-muted-foreground">
                    offer_hash: {p.offer_hash || "—"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelId(p.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
