import { STRENGTHS } from "@/lib/site";

export default function WhyUs({ title = "ทำไมต้อง J.O. Vision Care" }: { title?: string }) {
  return (
    <section className="bp-section" aria-labelledby="why-us">
      <h2 id="why-us" className="bp-h">{title}</h2>
      <ul className="why">
        {STRENGTHS.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
      </ul>
    </section>
  );
}
