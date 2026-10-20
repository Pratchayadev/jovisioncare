import { ORG_ID, opticianId } from "./seo";
import type { Branch } from "./branches";
import type { Service } from "@/db/schema";

export const servesBranch = (s: Pick<Service, "branches">, id: Branch["id"]) => s.branches === "all" || s.branches === id;

export function serviceNode(s: Service, branches: Branch[], url: string) {
  const at = branches.filter((b) => servesBranch(s, b.id));
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: s.title,
    serviceType: s.title,
    description: s.summary ?? undefined,
    url,
    provider: { "@id": ORG_ID },
    availableChannel: at.map((b) => ({ "@type": "ServiceChannel", serviceLocation: { "@id": opticianId(b) } })),
    areaServed: at.map((b) => ({ "@type": "City", name: b.province })),
  };
}
