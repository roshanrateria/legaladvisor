import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  GitCompareArrows,
  AlertTriangle,
  MessageSquareQuote,
  ClipboardList,
  Library,
  Scale,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/library", label: "Document Library", icon: Library },
  { to: "/simplify", label: "Document Simplifier", icon: FileText },
  { to: "/compare", label: "Contract Comparator", icon: GitCompareArrows },
  { to: "/risks", label: "Risk Detector", icon: AlertTriangle },
  { to: "/qa", label: "Legal Q&A", icon: MessageSquareQuote },
  { to: "/actions", label: "Action Generator", icon: ClipboardList },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-navy-100 bg-navy-900 text-navy-100">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-navy-700">
        <div className="w-10 h-10 rounded-md bg-gold-400 flex items-center justify-center">
          <Scale className="w-5 h-5 text-navy-900" />
        </div>
        <div>
          <div className="font-serif text-2xl font-semibold text-white leading-none">Lexi</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold-300 mt-1">Legal AI</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-navy-700 text-white border-l-2 border-gold-400"
                  : "text-navy-200 hover:bg-navy-800 hover:text-white"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-navy-700 text-[11px] leading-relaxed text-navy-300">
        <div className="font-semibold text-gold-300 mb-1">Disclaimer</div>
        Lexi provides general information, not legal advice. Always consult a licensed attorney
        before relying on AI-generated summaries.
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <div className="lg:hidden flex overflow-x-auto gap-1 px-4 py-2 border-b border-navy-100 bg-navy-900 text-navy-100 text-xs whitespace-nowrap scroll-thin">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded ${
              isActive ? "bg-navy-700 text-white" : "text-navy-200"
            }`
          }
        >
          <item.icon className="w-3.5 h-3.5" />
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}