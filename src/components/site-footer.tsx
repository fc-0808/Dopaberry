import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { categories } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link aria-label="DopaBerry home" href="/">
              <BrandLogo />
            </Link>
            <p>{siteConfig.tagline}</p>
          </div>

          <div className="site-footer__links">
            <div>
              <h2>Shop</h2>
              <Link href="/shop">Shop all</Link>
              {categories.map((category) => (
                <Link
                  href={`/shop?category=${category.slug}`}
                  key={category.slug}
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <div>
              <h2>Help</h2>
              <Link href="/policies/shipping">Shipping</Link>
              <Link href="/policies/returns">Returns</Link>
              <a href={`mailto:${siteConfig.email}`}>Contact</a>
            </div>
            <div>
              <h2>Company</h2>
              <Link href="/about">About</Link>
              <Link href="/policies/privacy">Privacy</Link>
              <Link href="/policies/terms">Terms</Link>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} DopaBerry. All rights reserved.</p>
          <p>
            “Dopamine” names the color. It is not a health or wellness claim.
          </p>
          <p>Secure checkout powered by Stripe.</p>
        </div>
      </div>
    </footer>
  );
}
