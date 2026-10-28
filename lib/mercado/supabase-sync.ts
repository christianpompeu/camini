/**
 * CAMINI MERCADO — Camada de Sincronização com Supabase
 * 
 * Sincroniza carrinhos locais com o banco de dados remoto caso o usuário esteja autenticado.
 * Quando o usuário está em modo público/anônimo, a sincronização é ignorada de forma segura
 * e os dados permanecem 100% locais no dispositivo.
 */

import { createClient } from "@/lib/supabase/client";
import { MercadoCarrinho, MercadoItem } from "@/types/mercado";

export async function checkAuthUser() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Envia carrinhos locais para o Supabase e busca carrinhos remotos pertencentes ao usuário.
 */
export async function syncCartsWithSupabase(
  localCarts: MercadoCarrinho[]
): Promise<{ success: boolean; carts: MercadoCarrinho[]; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        carts: localCarts,
        error: "Usuário não autenticado. Os carrinhos permanecem salvos localmente.",
      };
    }

    const userId = user.id;

    // 1. Enviar ou atualizar cada carrinho local para o Supabase
    for (const cart of localCarts) {
      // Upsert do carrinho
      const { error: cartError } = await supabase
        .from("mercado_carrinhos")
        .upsert(
          {
            id: cart.id,
            user_id: userId,
            nome: cart.nome,
            status: cart.status,
            total_estimado: cart.totalEstimado,
            total_final: cart.totalFinal || null,
            foto_cupom_base64: cart.fotoCupom || null,
            criado_em: cart.criadoEm,
            atualizado_em: new Date().toISOString(),
            finalizado_em: cart.finalizadoEm || null,
          },
          { onConflict: "id" }
        );

      if (cartError) {
        console.error(
          "[SYNC] Erro ao sincronizar carrinho:",
          cart.id,
          cartError.message || cartError,
          cartError.details || cartError.hint || ""
        );
        continue;
      }

      // Upsert dos itens do carrinho
      if (cart.itens && cart.itens.length > 0) {
        const itemRows = cart.itens.map((it, idx) => ({
          id: it.id,
          carrinho_id: cart.id,
          user_id: userId,
          nome: it.nome,
          quantidade: it.quantidade,
          preco_unitario: it.precoUnitario,
          preco_total: it.precoTotal,
          foto_produto_base64: it.fotoProduto || null,
          ordem: it.ordem ?? idx,
          criado_em: it.criadoEm,
          atualizado_em: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from("mercado_itens")
          .upsert(itemRows, { onConflict: "id" });

        if (itemsError) {
          console.error(
            "[SYNC] Erro ao sincronizar itens do carrinho:",
            cart.id,
            itemsError.message || itemsError,
            itemsError.details || itemsError.hint || ""
          );
        }
      }
    }

    // 2. Buscar todos os carrinhos e itens do usuário no Supabase para mesclar
    const { data: remoteCarts, error: fetchCartsError } = await supabase
      .from("mercado_carrinhos")
      .select(`
        id,
        user_id,
        nome,
        status,
        total_estimado,
        total_final,
        foto_cupom_base64,
        criado_em,
        atualizado_em,
        finalizado_em,
        mercado_itens (
          id,
          carrinho_id,
          user_id,
          nome,
          quantidade,
          preco_unitario,
          preco_total,
          foto_produto_base64,
          ordem,
          criado_em,
          atualizado_em
        )
      `)
      .eq("user_id", userId)
      .order("criado_em", { ascending: false });

    if (fetchCartsError || !remoteCarts) {
      console.warn("[SYNC] Não foi possível obter carrinhos remotos:", fetchCartsError);
      return { success: true, carts: localCarts };
    }

    // 3. Mapear do formato SQL para o modelo da aplicação
    const mergedCartsMap = new Map<string, MercadoCarrinho>();

    // Inicializar com remotos
    for (const rc of remoteCarts) {
      const itemsList: MercadoItem[] = ((rc as any).mercado_itens || [])
        .map((it: any) => ({
          id: it.id,
          carrinhoId: it.carrinho_id,
          nome: it.nome,
          quantidade: Number(it.quantidade),
          precoUnitario: Number(it.preco_unitario),
          precoTotal: Number(it.preco_total),
          fotoProduto: it.foto_produto_base64 || undefined,
          ordem: it.ordem || 0,
          criadoEm: it.criado_em,
          atualizadoEm: it.atualizado_em,
        }))
        .sort((a: MercadoItem, b: MercadoItem) => a.ordem - b.ordem);

      mergedCartsMap.set(rc.id, {
        id: rc.id,
        userId: rc.user_id,
        nome: rc.nome,
        status: rc.status as any,
        totalEstimado: Number(rc.total_estimado),
        totalFinal: rc.total_final ? Number(rc.total_final) : null,
        fotoCupom: rc.foto_cupom_base64 || null,
        criadoEm: rc.criado_em,
        atualizadoEm: rc.atualizado_em,
        finalizadoEm: rc.finalizado_em || null,
        itens: itemsList,
        syncStatus: "synced",
      });
    }

    // Mesclar locais mais recentes caso haja divergência
    for (const lc of localCarts) {
      const existing = mergedCartsMap.get(lc.id);
      if (!existing) {
        mergedCartsMap.set(lc.id, { ...lc, syncStatus: "synced" });
      } else {
        const localTime = new Date(lc.atualizadoEm).getTime();
        const remoteTime = new Date(existing.atualizadoEm).getTime();
        if (localTime > remoteTime) {
          mergedCartsMap.set(lc.id, { ...lc, syncStatus: "synced" });
        }
      }
    }

    const finalCarts = Array.from(mergedCartsMap.values()).sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    );

    return { success: true, carts: finalCarts };
  } catch (err: any) {
    console.error("[SYNC] Exceção durante sincronização:", err);
    return {
      success: false,
      carts: localCarts,
      error: err?.message || "Erro desconhecido na sincronização",
    };
  }
}
