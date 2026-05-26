// presence.ts
import { pb } from "./pb";
import { getPlayer, clearPlayer } from "./session";

export function startPresence() {
  async function ping() {
    const player = getPlayer();
    if (!player) {
      console.log("Ping: kein player gefunden");
      return;
    }

    await pb.collection("gtsuser").update(player.id, {
      active: true,
      last_seen: new Date().toISOString(),
    });
  }

  function setInactive() {
    const player = getPlayer();
    if (!player) return;
    const url = `${import.meta.env.VITE_PB_URL}/api/collections/gtsuser/records/${player.id}`;
    const data = JSON.stringify({ active: false });
    navigator.sendBeacon(url, new Blob([data], { type: "application/json" }));
  }

  ping();
  const interval = setInterval(ping, 20_000);

  window.addEventListener("beforeunload", setInactive);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") setInactive();
    if (document.visibilityState === "visible") ping();
  });

  return () => {
    clearInterval(interval);
    window.removeEventListener("beforeunload", setInactive);
    clearPlayer();
  };
}
