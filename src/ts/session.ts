// session.ts
import { pb } from "./pb";

export async function login(name: string) {
  const cutoff = new Date(Date.now() - 5 * 60_000).toISOString();

  const active = await pb.collection("gtsuser").getList(1, 1, {
    filter: `name = "${name}" && active = true && last_seen > "${cutoff}"`,
  });

  if (active.totalItems > 0) {
    throw new Error("Dieser Name wird gerade verwendet.");
  }

  // Alte Einträge mit dem Namen löschen
  const inactive = await pb.collection("gtsuser").getList(1, 50, {
    filter: `name = "${name}"`,
  });
  await Promise.all(
    inactive.items.map((p) => pb.collection("gtsuser").delete(p.id)),
  );

  const anyActive = await pb.collection("gtsuser").getList(1, 1, {
    filter: `active = true && last_seen > "${cutoff}"`,
  });

  const player = await pb.collection("gtsuser").create({
    name,
    active: true,
    last_seen: new Date().toISOString(),
    is_host: anyActive.totalItems === 0,
  });

  localStorage.setItem("player", JSON.stringify(player));
  return player;
}

export function getPlayer() {
  const raw = localStorage.getItem("player");
  return raw ? JSON.parse(raw) : null;
}

export function clearPlayer() {
  localStorage.removeItem("player");
}
