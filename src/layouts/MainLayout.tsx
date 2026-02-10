import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MapPreview from "../components/MapPreview";
import type { Spot } from "../types/Spot";

// URL 生成工具函數 (保持在外部或移至 utils.ts)
const generateGoogleMapsUrl = (spots: Spot[]): string => {
  if (spots.length === 0) return "https://www.google.com/maps";
  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const origin = encodeURIComponent(`${spots[0].lat},${spots[0].lng}`);
  const destination = encodeURIComponent(
    `${spots[spots.length - 1].lat},${spots[spots.length - 1].lng}`,
  );
  let waypoints = "";
  if (spots.length > 2) {
    const intermediate = spots
      .slice(1, -1)
      .map((s) => `${s.lat},${s.lng}`)
      .join("|");
    waypoints = `&waypoints=${encodeURIComponent(intermediate)}`;
  }
  return `${baseUrl}&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
};

export default function MainLayout() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // 初始化：從 URL 恢復資料
  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(data)));
        setSpots(decoded);
      } catch (e) {
        console.error("URL Data Parse Error", e);
      }
    }
  }, []);

  // 同步狀態到 URL
  const syncUrl = useCallback(
    (newSpots: Spot[]) => {
      if (newSpots.length === 0) {
        setSearchParams({});
      } else {
        const encoded = btoa(encodeURIComponent(JSON.stringify(newSpots)));
        setSearchParams({ data: encoded });
      }
    },
    [setSearchParams],
  );

  const handleAddSpot = useCallback(
    (newSpot: Spot) => {
      setSpots((prev) => {
        const next = [...prev, newSpot];
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const handleRemoveSpot = useCallback(
    (id: string) => {
      setSpots((prev) => {
        const next = prev.filter((s) => s.id !== id);
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const handleExport = useCallback(() => {
    window.open(generateGoogleMapsUrl(spots), "_blank");
  }, [spots]);

  return (
    <main className="flex h-dvh w-screen overflow-hidden bg-white">
      {/* 側邊欄 */}
      <div
        className={`${viewMode === "list" ? "flex" : "hidden"} md:flex w-full md:w-80 h-full shrink-0 z-20`}
      >
        <Sidebar
          spots={spots}
          onRemoveSpot={handleRemoveSpot}
          onAddSpot={handleAddSpot}
          onOpenMap={() => setViewMode("map")}
        />
      </div>

      {/* 地圖區域 */}
      <div
        className={`${viewMode === "map" ? "flex" : "hidden"} md:flex grow h-full relative z-10`}
      >
        <MapPreview
          spots={spots}
          onGenerateMapUrl={handleExport}
          onBackToList={() => setViewMode("list")}
        />
      </div>
    </main>
  );
}
