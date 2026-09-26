import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar, MobileNav } from "./components/Sidebar";
import { Overview } from "./pages/Overview";
import { Library } from "./pages/Library";
import { DocumentDetail } from "./pages/DocumentDetail";
import { Simplify } from "./pages/Simplify";
import { Compare } from "./pages/Compare";
import { Risks } from "./pages/Risks";
import { QA } from "./pages/QA";
import { Actions } from "./pages/Actions";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-parchment-50 paper-texture">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3 focus:text-navy-900 focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileNav />
          <main id="main-content" tabIndex={-1} className="flex-1 px-6 lg:px-10 py-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/:id" element={<DocumentDetail />} />
              <Route path="/simplify" element={<Simplify />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/risks" element={<Risks />} />
              <Route path="/qa" element={<QA />} />
              <Route path="/actions" element={<Actions />} />
            </Routes>
          </main>
          <footer className="border-t border-navy-100 bg-white/50 px-6 lg:px-10 py-6 text-xs text-navy-500 text-center">
            Lexi · GenAI-powered legal information and assistance · This is not legal advice.
            Always consult a licensed attorney.
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;