import { HashRouter, Route, Routes } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import MainLayout from "./layouts/MainLayout"; // 匯入拆分後的 Layout

function App() {
  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
      libraries={["places"]}
    >
      <HashRouter>
        <Routes>
          {/* 所有邏輯都在 MainLayout 處理 */}
          <Route path="/" element={<MainLayout />} />
        </Routes>
      </HashRouter>
    </APIProvider>
  );
}

export default App;
