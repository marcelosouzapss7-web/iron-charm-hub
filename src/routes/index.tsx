import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Plus } from "lucide-react";
import { cart } from "@/lib/cart";
import { useEffect, useRef, useState } from "react";

export const produtosQuery = queryOptions({
  queryKey: ["products"],
  retry: 1,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,price,old_price,description,best_seller,image_url,position,created_at")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  retry: 1,
  queryFn: async () =>
    (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
});

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Look China — Nossos Produtos" },
      {
        name: "description",
        content: "Confira os produtos do Look China com os melhores preços.",
      },
      { property: "og:title", content: "Look China — Nossos Produtos" },
      {
        property: "og:description",
        content: "Confira os produtos do Look China com os melhores preços.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content:
          "https://lookchinavariedades.store/og-look-china.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content:
          "https://lookchinavariedades.store/og-look-china.jpg",
      },
    ],
  }),
  pendingMs: 0,
  pendingComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex items-center gap-3">
        <span
          aria-label="Carregando produtos"
          className="size-8 animate-spin rounded-full border-4 border-muted-foreground/25 border-t-primary"
        />
        <p className="text-sm text-muted-foreground">Carregando produtos, por favor aguarde</p>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-semibold text-foreground">Não foi possível carregar os produtos.</p>
        <a href="/" className="mt-4 inline-block text-sm font-bold text-primary underline">
          Tentar novamente
        </a>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      Página não encontrada.
    </div>
  ),
  component: Index,
});

const brl = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Index() {
  const { data: produtos = [], isPending, isError, refetch } = useQuery(produtosQuery);
  const { data: settings } = useQuery(settingsQuery);
  const s = settings as any;
  const heros = [s?.hero_image_url, s?.hero_image_url_2, s?.hero_image_url_3].filter(
    Boolean,
  ) as string[];
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (heros.length < 2) return;
    const t = setInterval(() => setSlide((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, [heros.length, slide]);
  const toqueX = useRef<number | null>(null);
  const arrastou = useRef(false);

  function irParaProdutos() {
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" });
  }

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-3">
          <span
            aria-label="Carregando produtos"
            className="size-8 animate-spin rounded-full border-4 border-muted-foreground/25 border-t-primary"
          />
          <p className="text-sm text-muted-foreground">Carregando produtos, por favor aguarde</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div>
          <p className="font-semibold text-foreground">Não foi possível carregar os produtos.</p>
          <button
            onClick={() => void refetch()}
            className="mt-4 text-sm font-bold text-primary underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const destaques = produtos.slice(0, 8);
  const resto = produtos.slice(8);
  const card = (p: (typeof produtos)[number], idx: number) => {
              return (
                <div>
                  <Link to="/produto/$id" params={{ id: p.id }} className="block">
                    {p.image_url ? (
                      <ImagemPrincipal
                        key={p.image_url}
                        src={p.image_url}
                        alt={p.name}
                        loading={idx < 4 ? "eager" : "lazy"}
                        fetchPriority={idx < 2 ? "high" : "auto"}
                      />
                    ) : (
                      <div className="aspect-[3/4] w-full bg-muted" />
                    )}
                    <p className="mt-2 text-[13px] font-medium leading-snug text-foreground">
                      {p.name}
                    </p>
                    <p className="mt-1 text-base font-bold text-primary">{brl(p.price)}</p>
                  </Link>
                  <div className="mt-2 flex gap-2">
                    <Link
                      to="/produto/$id"
                      params={{ id: p.id }}
                      className="flex-1 rounded-md bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground"
                    >
                      Comprar
                    </Link>
                    <button
                      aria-label="Adicionar ao carrinho"
                      onClick={() =>
                        cart.add({
                          id: p.id,
                          name: p.name,
                          price: Number(p.price),
                          oldPrice: p.old_price != null ? Number(p.old_price) : null,
                          image: p.image_url || null,
                          size: null,
                        })
                      }
                      className="flex w-14 items-center justify-center gap-1 rounded-md border border-primary text-primary"
                    >
                      <Plus className="size-3" /> <ShoppingCart className="size-4" />
                    </button>
                  </div>
                </div>
              );
  };

  return (
    <div className="min-h-screen bg-muted" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <StoreHeader />

        {heros.length > 0 && (
          <section
            className="relative overflow-hidden bg-background"
            onTouchStart={(e) => (toqueX.current = (e.touches[0]?.clientX ?? null))}
            onTouchEnd={(e) => {
              if (toqueX.current === null || heros.length < 2) return;
              const dx = (e.changedTouches[0]?.clientX ?? toqueX.current) - toqueX.current;
              toqueX.current = null;
              if (Math.abs(dx) < 40) return;
              arrastou.current = true;
              setTimeout(() => (arrastou.current = false), 400);
              setSlide((n) => {
                const atual = n % heros.length;
                return dx < 0 ? (atual + 1) % heros.length : (atual - 1 + heros.length) % heros.length;
              });
            }}
          >
            <button onClick={() => { if (arrastou.current) { arrastou.current = false; return; } irParaProdutos(); }} className="block w-full" aria-label="Ver produtos">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${(slide % heros.length) * 100}%)` }}
              >
                {heros.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Promoção da loja ${i + 1}`}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    className="block h-auto w-full shrink-0"
                  />
                ))}
              </div>
            </button>
            {heros.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {heros.map((_, i) => (
                  <span
                    key={i}
                    className={`size-2 rounded-full ${i === slide % heros.length ? "bg-primary" : "bg-background/70"}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <main id="produtos" className="pb-10">
          <h1 className="px-4 pb-6 pt-8 text-center text-[2.4rem] font-bold leading-[1.05] text-primary">
            queridinhos da wepink
          </h1>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
            {destaques.map((p, idx) => (
              <div key={p.id} className="w-[62%] shrink-0 snap-start">{card(p, idx)}</div>
            ))}
          </div>
          {(s?.featured_image_url || s?.featured_title) && (
            <section className="mx-3 mt-10 overflow-hidden rounded border bg-background shadow-sm">
              {s?.featured_image_url && (
                <img src={s.featured_image_url} alt={s?.featured_title || "Destaque do mês"} className="block h-auto w-full" />
              )}
              <div className="bg-primary px-9 py-9 text-primary-foreground">
                {s?.featured_tag && <p className="text-xl font-bold">{s.featured_tag}</p>}
                {s?.featured_title && <h2 className="mt-5 text-xl font-bold leading-tight">{s.featured_title}</h2>}
                {s?.featured_description && <p className="mt-5 text-[15px] leading-snug">{s.featured_description}</p>}
                {s?.featured_price && <p className="mt-8 text-base font-bold">{s.featured_price}</p>}
                <button
                  onClick={() => document.getElementById("mais-produtos")?.scrollIntoView({ behavior: "smooth" })}
                  className="mt-5 w-full max-w-[162px] rounded border border-primary-foreground py-2 text-[15px]"
                >
                  {s?.featured_button || "eu quero!"}
                </button>
              </div>
            </section>
          )}
          {produtos.some((p) => p.best_seller) && (
            <section className="pt-10">
              <h2 className="px-4 pb-6 text-center text-[2.4rem] font-bold leading-[1.05] text-primary">
                os mais vendidos
              </h2>
              <div className="space-y-12 px-5">
                {produtos.filter((p) => p.best_seller).map((p) => (
                  <div key={p.id}>
                    <Link to="/produto/$id" params={{ id: p.id }} className="block">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} loading="lazy" className="aspect-square w-full object-contain" />
                      ) : (
                        <div className="aspect-square w-full bg-muted" />
                      )}
                      <p className="mt-4 text-base font-bold leading-snug text-foreground">{p.name}</p>
                      {p.description && (
                        <p className="mt-2 line-clamp-1 text-sm text-foreground">{p.description}</p>
                      )}
                      {p.old_price != null && Number(p.old_price) > Number(p.price) && (
                        <p className="text-xs font-semibold text-muted-foreground line-through">{brl(Number(p.old_price))}</p>
                      )}
                      <p className="text-lg font-bold text-foreground">
                        {brl(p.price)}{" "}
                        <span className="text-xs font-normal">ou 6x {brl(Number(p.price) / 6)}</span>
                      </p>
                    </Link>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/produto/$id"
                        params={{ id: p.id }}
                        className="flex-1 rounded-md bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
                      >
                        Comprar
                      </Link>
                      <button
                        aria-label="Adicionar à sacola"
                        onClick={() => {
                          cart.add({ id: p.id, name: p.name, price: Number(p.price), oldPrice: p.old_price != null ? Number(p.old_price) : null, image: p.image_url || null, size: null });
                        }}
                        className="flex w-20 items-center justify-center gap-2 rounded-md border border-primary text-primary"
                      >
                        <Plus className="size-3" /> <ShoppingCart className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {resto.length > 0 && (
            <>
              <h2 id="mais-produtos" className="px-4 pb-4 pt-10 text-center text-3xl font-bold text-primary">mais produtos</h2>
              <div className="grid grid-cols-2 gap-3 px-3">
                {resto.map((p, idx) => <div key={p.id}>{card(p, idx + destaques.length)}</div>)}
          </div>

            </>
          )}
          {produtos.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum produto cadastrado ainda.
            </p>
          )}
        </main>
        <StoreFooter />
      </div>
    </div>
  );
}

function ImagemPrincipal({
  src,
  alt,
  loading,
  fetchPriority,
}: {
  src: string;
  alt: string;
  loading: "eager" | "lazy";
  fetchPriority: "high" | "auto";
}) {
  const [carregada, setCarregada] = useState(false);
  const [falhou, setFalhou] = useState(false);
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
      {!carregada && !falhou && (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
      )}
      {!falhou && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          onLoad={() => setCarregada(true)}
          onError={() => setFalhou(true)}
          className={`h-full w-full object-cover transition-opacity ${carregada ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
