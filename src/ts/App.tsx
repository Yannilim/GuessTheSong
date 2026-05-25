import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { pb } from "./pb";

import LobbyPage from "./Pages/LobbyPage";
import GamePage from "./Pages/GamePage";
import LoginPage from "./Pages/LoginPage";
import Navbar from "./Components/Navbar";
import "../scss/App.scss";

function PrivateRoute() {
  if (!pb.authStore.isValid) return <Navigate to="/" />;
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  useEffect(() => {
    let cancelled = false;

    pb.health
      .check()
      .then((result) => {
        if (!cancelled) console.log("PocketBase verbunden:", result);
      })
      .catch((err) => {
        if (!cancelled) console.error("Verbindung fehlgeschlagen:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/session/:id" element={<GamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
