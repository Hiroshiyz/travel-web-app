import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Search, Trash2, Map as MapIcon, ChevronLeft } from "lucide-react"; // 引入 ChevronLeft
import type { Spot } from "../types/Spot";

declare global {
  interface Window {
    google: any;
  }
}

interface SidebarProps {
  spots: Spot[];
  onRemoveSpot: (id: string) => void;
  onOpenMap: () => void;
  onAddSpot: (spot: Spot) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  spots,
  onRemoveSpot,
  onOpenMap,
  onAddSpot,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLibrary = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    const options = {
      fields: ["place_id", "geometry", "name", "formatted_address"],
      componentRestrictions: { country: "id" },
      bounds: {
        north: -8.0,
        south: -9.0,
        east: 116.0,
        west: 114.3,
      },
      strictBounds: false,
    };

    const ac = new placesLibrary.Autocomplete(inputRef.current, options);

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      onAddSpot({
        id: place.place_id || Math.random().toString(),
        name: place.name || place.formatted_address || "未知景點",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });

      if (inputRef.current) inputRef.current.value = "";
    });

    return () => {
      if (window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(ac);
      }
    };
  }, [placesLibrary, onAddSpot]);

  return (
    <aside className="w-full flex flex-col h-full bg-white border-r border-gray-100 shadow-2xl overflow-hidden">
      {/* Tiffany 綠 Header - 加入返回按鈕 */}
      <div className="p-6 bg-brand text-white shrink-0 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 手機版專用：返回地圖按鈕 (md 以上隱藏) */}
          <button
            onClick={onOpenMap}
            className="md:hidden p-1.5 -ml-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="返回地圖"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <MapIcon size={24} /> 旅遊規劃
          </h2>
        </div>

        {/* 顯示景點總數的小標籤 */}
        <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold">
          {spots.length} 點
        </span>
      </div>

      {/* 搜尋區塊 */}
      <div className="p-4 bg-white border-b border-gray-50 shrink-0">
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-brand/50 outline-none transition-all placeholder:text-gray-400"
            placeholder={placesLibrary ? "搜尋景點..." : "服務載入中..."}
            disabled={!placesLibrary}
          />
          <Search
            className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-brand transition-colors"
            size={20}
          />
        </div>
      </div>

      {/* 景點清單區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/20">
        {spots.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <p className="text-sm">尚未加入任何景點</p>
          </div>
        ) : (
          spots.map((spot, index) => (
            <div
              key={spot.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-brand/10 text-brand rounded-full text-[10px] font-black">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold text-gray-700 truncate w-32 md:w-40">
                  {spot.name}
                </span>
              </div>
              <button
                onClick={() => onRemoveSpot(spot.id)}
                className="text-gray-300 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 底部導出按鈕 */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <button
          onClick={onOpenMap}
          disabled={spots.length === 0}
          className="w-full py-4 bg-brand text-white rounded-2xl font-black shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none"
        >
          查看地圖預覽
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
