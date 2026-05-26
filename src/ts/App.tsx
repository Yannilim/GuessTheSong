// App.tsx
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { getPlayer } from "./session";
import { startPresence } from "./presence";
import Navbar from "./Components/Navbar";
import LoginPage from "./Pages/LoginPage";
import LobbyPage from "./Pages/LobbyPage";
import GamePage from "./Pages/GamePage";

function PrivateRoute() {
  if (!getPlayer()) return <Navigate to="/" />;
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  const [player, setPlayer] = useState(getPlayer());

  useEffect(() => {
    if (player) {
      const stop = startPresence();
      return stop;
    }
  }, [player]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LoginPage onLogin={() => setPlayer(getPlayer())} />}
        />
        <Route element={<PrivateRoute />}>
          <Route path="/session" element={<GamePage />} />
          <Route path="/songs" element={<LobbyPage />} />
          <Route path="/upload" element={<LobbyPage />} />
          <Route path="/settings" element={<LobbyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
