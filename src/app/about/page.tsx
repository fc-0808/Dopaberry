import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  path: "/about",
  title: "About",
  description:
    "DopaBerry is a mobile accessories brand built around saturated color and practical everyday details.",
});

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="about-hero shell">
        <p className="eyebrow">About</p>
        <h1>
          Color you can <span>reach for.</span>
        </h1>
        <p>
          DopaBerry designs mobile accessories so the brightest thing in your day
          can also be the most useful one.
        </p>
      </section>

      <section className="shell about-grid">
        <div className="about-art" aria-hidden="true">
          <span className="about-art__panel about-art__panel--sun" />
          <span className="about-art__panel about-art__panel--ink" />
          <span className="about-art__panel about-art__panel--rose" />
          <p className="about-art__type">
            Color,
            <br />
            in use.
          </p>
        </div>
        <div className="about-copy">
          <p className="eyebrow">The idea</p>
          <h2>Color is the point.</h2>
          <p>
            Phones and earbuds go nearly everywhere. DopaBerry started from a
            practical question: those objects can be protective and still have a
            palette worth keeping in view.
          </p>
          <p>
            The collection is built around saturated color, precise fit, and
            protection for daily use. “Dopamine-inspired” describes that visual
            language. It is not a medical or wellness claim.
          </p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="shell">
          <div className="section-heading section-heading--center">
            <div>
              <p className="eyebrow">What guides us</p>
              <h2>Considered, practical, and plain-spoken.</h2>
            </div>
          </div>
          <div className="principle-grid">
            <article>
              <Sparkles aria-hidden="true" />
              <h3>Designed with intent</h3>
              <p>
                Color, form, and finish are chosen so each piece is recognizable
                without relying on novelty.
              </p>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" />
              <h3>Useful first</h3>
              <p>
                Good looks matter, but so do fit, protection, charging access,
                and a comfortable grip.
              </p>
            </article>
            <article>
              <Heart aria-hidden="true" />
              <h3>No overpromising</h3>
              <p>
                We describe materials and compatibility plainly, without
                invented wellness benefits or vague hype.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="shell about-cta">
        <p className="eyebrow">The collection</p>
        <h2>See the current edit.</h2>
        <Link className="button button--primary" href="/shop">
          Shop the collection
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    </div>
  );
}
