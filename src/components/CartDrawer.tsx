import { ShoppingCart, X, Minus, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cart, useCart } from "@/lib/cart";

const brl = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CartDrawer() {
  const { items, open } = useCart();
  if (!open) return null;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const cheio = items.reduce((s, i) => s + Math.max(i.oldPrice ?? i.price, i.price) * i.qty, 0);
  const desconto = cheio - total;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40" onClick={cart.close}>
      <div
        className="flex h-full w-[76%] max-w-sm flex-col bg-background animate-in slide-in-from-right"
        style={{ fontFamily: "Montserrat, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-3 py-3">
          <span className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ShoppingCart className="size-5" /> seu carrinho
          </span>
          <button aria-label="Fechar" onClick={cart.close} className="text-foreground">
            <X className="size-7" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          {items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          )}
          {items.map((it, k) => (
            <div key={k} className="flex gap-3 border-b py-4">
              {it.image ? (
                <img src={it.image} alt={it.name} className="size-24 shrink-0 object-contain" />
              ) : (
                <div className="size-24 shrink-0 bg-muted" />
              )}
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-xs font-bold leading-snug text-foreground">
                    {it.name}
                    {it.size ? ` — Tam. ${it.size}` : ""}
                  </p>
                  <button
                    aria-label="Remover"
                    onClick={() => cart.remove(k)}
                    className="grid size-4 place-items-center rounded-full bg-muted-foreground/40 text-background"
                  >
                    <X className="size-3" />
                  </button>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      aria-label="Diminuir"
                      onClick={() => (it.qty <= 1 ? cart.remove(k) : cart.setQty(k, it.qty - 1))}
                      className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Minus className="size-4" strokeWidth={3} />
                    </button>
                    <span className="text-sm font-bold">{it.qty}</span>
                    <button
                      aria-label="Aumentar"
                      onClick={() => cart.setQty(k, it.qty + 1)}
                      className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Plus className="size-4" strokeWidth={3} />
                    </button>
                  </div>
                  <div className="text-right">
                    {it.oldPrice != null && it.oldPrice > it.price && (
                      <p className="text-xs text-muted-foreground line-through">{brl(it.oldPrice * it.qty)}</p>
                    )}
                    <p className="text-base font-bold text-primary">{brl(it.price * it.qty)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t px-3 pb-5 pt-5 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.15)]">
          {desconto > 0 && (
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>descontos</span>
              <span className="text-base font-bold text-primary">-{brl(desconto)}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs font-semibold">
            <span>total</span>
            <span className="text-base font-bold text-primary">{brl(total)}</span>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <button onClick={cart.close} className="text-left text-xs font-bold leading-tight underline">
              continuar
              <br />
              comprando
            </button>
            <Link
              to="/carrinho"
              onClick={cart.close}
              className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              finalizar compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
