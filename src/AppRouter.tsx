import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navigation } from "./components/Navigation";

import Index from "./pages/Index";
import { NIP19Page } from "./pages/NIP19Page";
import { HexedNotesPage } from "./pages/HexedNotesPage";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Navigation />
      <ScrollToTop />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hexed-notes" element={<HexedNotesPage />} />
          {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
          <Route path="/:nip19" element={<NIP19Page />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
export default AppRouter;