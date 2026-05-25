// pb.ts
import PocketBase from "pocketbase";

export const pb = new PocketBase(import.meta.env.VITE_PB_URL);
console.log("PB URL:", import.meta.env.VITE_PB_URL);
console.log("MODE:", import.meta.env.MODE);
