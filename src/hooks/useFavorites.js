// ============================================================
// DOSYA: src/hooks/useFavorites.js  (YENİ DOSYA)
// Favori işlemlerini yöneten custom React hook
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Kullanıcının tüm favorilerini yönetir.
 * Herhangi bir bileşende çağrılabilir.
 *
 * Kullanım:
 *   const { favorites, isFavorite, toggleFavorite, loading } = useFavorites();
 */
export function useFavorites() {
  const [favorites, setFavorites]   = useState([]);   // { id, product_id, ... }[]
  const [userId, setUserId]         = useState(null);
  const [loading, setLoading]       = useState(true);

  // Oturumdaki kullanıcıyı al
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });

    // Oturum değişikliklerini dinle (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Kullanıcı değişince favorileri çek
  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("favorites")
      .select("id, product_id, created_at")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (!error && data) setFavorites(data);
        setLoading(false);
      });
  }, [userId]);

  /** Verilen product_id favori mi? */
  const isFavorite = useCallback(
    (productId) => favorites.some((f) => f.product_id === productId),
    [favorites]
  );

  /**
   * Favoriye ekle ya da çıkar.
   * Optimistic UI: sunucu yanıtı beklenmeden anlık güncelleme yapılır.
   */
  const toggleFavorite = useCallback(
    async (productId) => {
      if (!userId) return; // Giriş yapılmamışsa işlem yapma

      const already = isFavorite(productId);

      if (already) {
        // ── Favoriden çıkar ──
        const toRemove = favorites.find((f) => f.product_id === productId);
        // Optimistic: hemen listeden kaldır
        setFavorites((prev) => prev.filter((f) => f.product_id !== productId));

        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", toRemove.id);

        if (error) {
          // Hata olursa geri al
          setFavorites((prev) => [...prev, toRemove]);
          console.error("Favori silinemedi:", error.message);
        }
      } else {
        // ── Favoriye ekle ──
        const optimistic = { id: crypto.randomUUID(), product_id: productId, created_at: new Date().toISOString() };
        // Optimistic: hemen listeye ekle
        setFavorites((prev) => [...prev, optimistic]);

        const { data, error } = await supabase
          .from("favorites")
          .insert({ user_id: userId, product_id: productId })
          .select("id, product_id, created_at")
          .single();

        if (error) {
          // Hata olursa geri al
          setFavorites((prev) => prev.filter((f) => f.id !== optimistic.id));
          console.error("Favori eklenemedi:", error.message);
        } else {
          // Geçici ID'yi gerçek ID ile değiştir
          setFavorites((prev) =>
            prev.map((f) => (f.id === optimistic.id ? data : f))
          );
        }
      }
    },
    [userId, favorites, isFavorite]
  );

  /**
   * Profil sayfası için: favori product_id listesini döndürür.
   * Bu ID'lerle products tablosundan veri çekebilirsin.
   */
  const favoriteProductIds = favorites.map((f) => f.product_id);

  return { favorites, favoriteProductIds, isFavorite, toggleFavorite, loading, userId };
}
