"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { categories } from "@/lib/catalog";
import { useCartHydration } from "@/lib/cart-hydration";
import { getCartItemCount, useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartHydration();
  const itemCount = hasHydrated ? getCartItemCount(items) : 0;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const desktopMediaQuery = window.matchMedia("(min-width: 821px)");
    document.body.style.overflow = "hidden";
    firstMobileLinkRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = [
        menuButtonRef.current,
        ...(mobileNavigationRef.current?.querySelectorAll<HTMLAnchorElement>(
          "a",
        ) ?? []),
      ].filter((element): element is HTMLButtonElement | HTMLAnchorElement =>
        Boolean(element),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (
        event.shiftKey &&
        document.activeElement === firstElement &&
        lastElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement &&
        firstElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function closeAtDesktop(event: MediaQueryListEvent) {
      if (event.matches) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    desktopMediaQuery.addEventListener("change", closeAtDesktop);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopMediaQuery.removeEventListener("change", closeAtDesktop);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="announcement">
        <p>
          Free US shipping on orders over{" "}
          {formatPrice(siteConfig.freeShippingThreshold)}
          <span aria-hidden="true"> · </span>
          <Link href="/policies/returns">{`${siteConfig.returnWindowDays}-day returns`}</Link>
        </p>
      </div>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link
            aria-label="DopaBerry home"
            className="site-header__logo"
            href="/"
            onClick={closeMenu}
          >
            <BrandLogo />
          </Link>

          <nav aria-label="Primary navigation" className="desktop-nav">
            <Link href="/shop">Shop all</Link>
            {categories.map((category) => (
              <Link
                href={`/shop?category=${category.slug}`}
                key={category.slug}
              >
                {category.shortName}
              </Link>
            ))}
            <Link href="/about">About</Link>
          </nav>

          <div className="site-header__actions">
            <Link
              aria-label={`Cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              className="cart-link"
              href="/cart"
            >
              <ShoppingBag aria-hidden="true" size={21} strokeWidth={2} />
              <span>Cart</span>
              <span aria-hidden="true" className="cart-link__count">
                {itemCount}
              </span>
            </Link>
            <button
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className="menu-button"
              onClick={() => setMenuOpen((open) => !open)}
              ref={menuButtonRef}
              type="button"
            >
              {menuOpen ? (
                <X aria-hidden="true" size={23} />
              ) : (
                <Menu aria-hidden="true" size={23} />
              )}
            </button>
          </div>
        </div>

        <nav
          aria-label="Mobile navigation"
          className={clsx("mobile-nav", menuOpen && "mobile-nav--open")}
          hidden={!menuOpen}
          id="mobile-navigation"
          ref={mobileNavigationRef}
        >
          <div className="shell mobile-nav__inner">
            <Link href="/shop" onClick={closeMenu} ref={firstMobileLinkRef}>
              Shop all
            </Link>
            {categories.map((category) => (
              <Link
                href={`/shop?category=${category.slug}`}
                key={category.slug}
                onClick={closeMenu}
              >
                {category.name}
              </Link>
            ))}
            <Link href="/about" onClick={closeMenu}>
              About
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
