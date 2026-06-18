// ============================================================
// DOSYA: src/components/FavoriteButton.jsx  (YENİ DOSYA)
// Bağımsız favori kalp butonu — ProductCard içinde kullanılır
// ============================================================

import { useState } from "react";

/**
 * Props:
 *  - isFav      : boolean  — başlangıç durumu
 *  - onToggle   : async () => void  — tıklanınca çağrılır
 *  - disabled   : boolean  — kullanıcı giriş yapmamışsa
 *  - size       : "sm" | "md" | "lg"  (varsayılan: "md")
 */
export default function FavoriteButton({
  isFav = false,
  onToggle,
  disabled = false,
  size = "md",
}) {
  const [animating, setAnimating] = useState(false);

  const sizeMap = {
    sm: "w-7 h-7 text-base",
    md: "w-9 h-9 text-xl",
    lg: "w-11 h-11 text-2xl",
  };

  const handleClick = async (e) => {
    e.preventDefault();   // Kart linki varsa engellesin
    e.stopPropagation();  // Event bubble'ı durdur

    if (disabled || !onToggle) return;

    setAnimating(true);
    await onToggle();
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      title={disabled ? "Favori eklemek için giriş yapın" : isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={[
        "flex items-center justify-center rounded-full",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400",
        sizeMap[size],
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer hover:scale-110 active:scale-95",
        isFav
          ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
          : "bg-white/80 text-gray-400 hover:bg-rose-50 hover:text-rose-400",
        animating ? "scale-125" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Dolu kalp (favori) */}
      {isFav ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[1em] h-[1em] drop-shadow-sm"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        /* Boş kalp (favoride değil) */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-[1em] h-[1em]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}
