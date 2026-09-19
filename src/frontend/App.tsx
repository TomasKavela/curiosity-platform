import { Routes, Route, Link, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Exploration from "./pages/Exploration";
import Idea from "./pages/Idea";
import ExplorationMap from "./pages/ExplorationMap";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

const NAV_ITEMS = [
  { to: "/home", label: "explorar" },
  { to: "/map", label: "percurso" },
  { to: "/history", label: "histórico" },
  { to: "/profile", label: "perfil" },
  { to: "/notifications", label: "notificações" },
  { to: "/settings", label: "definições" },
];

function GlobalNav() {
  const location = useLocation();
  if (location.pathname === "/" || location.pathname === "/onboarding") return null;

  return (
    <nav className="mx-auto flex max-w-prose flex-wrap gap-x-5 gap-y-2 px-6 pt-8 text-sm text-paper-faint">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`transition-colors hover:text-paper ${
            location.pathname.startsWith(item.to) ? "text-spark" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <>
      <GlobalNav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/exploration/:id" element={<Exploration />} />
        <Route path="/idea" element={<Idea />} />
        <Route path="/map" element={<ExplorationMap />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </>
  );
}
