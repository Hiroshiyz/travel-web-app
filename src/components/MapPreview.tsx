import React, { useEffect } from "react";
import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { ChevronLeft, Map as MapIcon, Share2 } from "lucide-react";
import type { Spot } from "../types/Spot";

interface MapPreviewProps {
  spots: Spot[];
  onGenerateMapUrl: (spots: Spot[]) => void;
  onBackToList: () => void;
}

const MapPreview: React.FC<MapPreviewProps> = ({
  spots,
  onGenerateMapUrl,
  onBackToList,
}) => {
  const map = useMap();

  // 1. 自動平移邏輯：僅在有新點加入時觸發
  useEffect(() => {
    if (map && spots.length > 0) {
      const lastSpot = spots[spots.length - 1];
      map.panTo({ lat: lastSpot.lat, lng: lastSpot.lng });
      map.setZoom(14); // 加入新點時放大
    }
  }, [map, spots]);

  // 2. 初始中心點：峇里島 (或是第一個景點)
  const defaultCenter =
    spots.length > 0
      ? { lat: spots[0].lat, lng: spots[0].lng }
      : { lat: -8.4095, lng: 115.1889 };

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-none h-16 flex items-center justify-between px-4 bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToList}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-black text-gray-800">行程預覽</h2>
        </div>

        <button
          onClick={() => onGenerateMapUrl(spots)}
          disabled={spots.length < 2}
          className="flex items-center gap-2 py-2 px-5 bg-brand hover:bg-tiffany-dark disabled:bg-gray-200 text-white text-sm font-bold rounded-full shadow-lg transition-all active:scale-95"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">匯出至 Google 地圖</span>
        </button>
      </div>

      {/* 地圖容器 */}
      <div className="flex-1 relative">
        {/* 核心修正：將 Map 移出判斷式。
            即便 spots.length === 0，地圖也應該渲染出來作為背景。
        */}
        <Map
          defaultZoom={spots.length > 0 ? 13 : 10} // 無景點時縮放 10 看峇里全島
          defaultCenter={defaultCenter}
          mapId={import.meta.env.VITE_GOOGLE_MAP_MAP_ID}
          gestureHandling={"greedy"}
          disableDefaultUI={false}
          mapTypeControl={false}
          className="w-full h-full" // 確保佔滿 flex-1 的空間
        >
          {/* 渲染所有景點標記 */}
          {spots.map((spot, index) => (
            <AdvancedMarker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
            >
              <Pin
                background={"#81d8d0"}
                borderColor={"#ffffff"}
                glyphColor={"#ffffff"}
                scale={1.2}
              />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-xl border border-brand/20 text-xs font-bold text-gray-800 whitespace-nowrap">
                <span className="text-tiffany-dark mr-1">{index + 1}.</span>
                {spot.name}
              </div>
            </AdvancedMarker>
          ))}
        </Map>

        {/* 只有當沒景點時，才覆蓋一個提示層 (可選) */}
        {spots.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-2xl border border-brand/20 flex items-center gap-2">
              <MapIcon className="text-brand" size={18} />
              <span className="text-sm font-bold text-gray-600">
                峇里島：請搜尋景點開始規劃
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPreview;
