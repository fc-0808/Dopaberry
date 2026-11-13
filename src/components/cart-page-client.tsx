"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import { ProductVisual } from "@/components/product-card";
import { getProductById, getVariant } from "@/lib/catalog";
import { useCartHydration } from "@/lib/cart-hydration";
import { getCartSubtotal, useCartStore } from "@/lib/cart-store";
import {
  checkoutSessionIdSchema,
  isStripeCheckoutUrl,
  maxQuantityPerLine,
} from "@/lib/checkout-schema";
import { formatPrice } from "@/lib/currency";
import { siteConfig } from "@/lib/site";

interface CheckoutResponse {
  readonly url?: string;
  readonly error?: string;
  readonly sessionId?: string;
  readonly code?: "checkout_session_expired" | "checkout_session_completed";
}

function isCheckoutResponse(value: unknown): value is CheckoutResponse {
  return typeof value === "object" && value !== null;
}

export function CartPageClient() {
  const router = useRouter();
  const hasHydrated = useCartHydration();

  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const checkoutInFlight = useRef(false);
  const confirmClearButtonRef = useRef<HTMLButtonElement>(null);
  const items = useCartStore((state) => state.items);
  const checkoutAttemptId = useCartStore((state) => state.checkoutAttemptId);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const markCheckoutPending = useCartStore(
    (state) => state.markCheckoutPending,
  );
  const renewCheckoutAttempt = useCartStore(
    (state) => state.renewCheckoutAttempt,
  );

  useEffect(() => {
    if (confirmingClear) {
      confirmClearButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  const lines = items.flatMap((item) => {
    const product = getProductById(item.productId);
    const variant = product ? getVariant(product, item.variantId) : undefined;
    return product && variant ? [{ item, product, variant }] : [];
  });
  const subtotal = getCartSubtotal(items);
  const shipping =
    subtotal >= siteConfig.freeShippingThreshold || subtotal === 0
      ? 0
      : siteConfig.standardShippingAmount;
  const total = subtotal + shipping;
  const amountUntilFreeShipping = Math.max(
    0,
    siteConfig.freeShippingThreshold - subtotal,
  );
  const shippingProgress = Math.min(
    100,
    Math.round((subtotal / siteConfig.freeShippingThreshold) * 100),
  );

  async function beginCheckout() {
    if (checkoutInFlight.current) {
      return;
    }

    checkoutInFlight.current = true;
    setCheckoutPending(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: checkoutAttemptId,
          items: items.map(({ productId, variantId, quantity }) => ({
            productId,
            variantId,
            quantity,
          })),
        }),
      });
      const payload: unknown = await response.json();

      if (!isCheckoutResponse(payload)) {
        throw new Error("Checkout returned an invalid response.");
      }

      if (!response.ok || !payload.url || !isStripeCheckoutUrl(payload.url)) {
        if (
          payload.code === "checkout_session_completed" &&
          payload.sessionId &&
          checkoutSessionIdSchema.safeParse(payload.sessionId).success
        ) {
          router.push(
            `/checkout/success?session_id=${encodeURIComponent(payload.sessionId)}`,
          );
          window.setTimeout(() => {
            checkoutInFlight.current = false;
            setCheckoutPending(false);
          }, 5_000);
          return;
        }

        if (payload.code === "checkout_session_expired") {
          renewCheckoutAttempt();
        }

        throw new Error(
          payload.error ?? "Checkout is unavailable. Please try again.",
        );
      }

      markCheckoutPending(checkoutAttemptId);
      window.location.assign(payload.url);
      window.setTimeout(() => {
        checkoutInFlight.current = false;
        setCheckoutPending(false);
      }, 5_000);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Checkout is unavailable. Please try again.",
      );
      checkoutInFlight.current = false;
      setCheckoutPending(false);
    }
  }

  if (!hasHydrated) {
    return (
      <div aria-label="Loading cart" className="cart-loading" role="status">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="empty-cart">
        <div aria-hidden="true" className="empty-cart__icon">
          <ShoppingBag size={30} />
        </div>
        <p className="eyebrow">Cart</p>
        <h1>Nothing here yet.</h1>
        <p>Add a case or another accessory when you are ready.</p>
        <Link className="button button--primary" href="/shop">
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section aria-labelledby="cart-heading" className="cart-lines">
        <div className="cart-lines__heading">
          <div>
            <p className="eyebrow">Cart</p>
            <h1 id="cart-heading">Your cart</h1>
          </div>
          {confirmingClear ? (
            <div
              aria-label="Confirm clearing cart"
              className="clear-bag-confirmation"
              role="group"
            >
              <span>Remove everything?</span>
              <button
                className="text-button"
                onClick={clearCart}
                ref={confirmClearButtonRef}
                type="button"
              >
                Yes, clear
              </button>
              <button
                className="text-button"
                onClick={() => setConfirmingClear(false)}
                type="button"
              >
                Keep items
              </button>
            </div>
          ) : (
            <button
              className="text-button"
              onClick={() => setConfirmingClear(true)}
              type="button"
            >
              Clear cart
            </button>
          )}
        </div>

        <div className="shipping-progress">
          <Truck aria-hidden="true" size={20} />
          <div>
            <p>
              {amountUntilFreeShipping > 0
                ? `You are ${formatPrice(amountUntilFreeShipping)} away from free US shipping.`
                : "You unlocked free US shipping."}
            </p>
            <div
              aria-label="Progress toward free shipping"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={shippingProgress}
              aria-valuetext={
                amountUntilFreeShipping > 0
                  ? `${formatPrice(amountUntilFreeShipping)} remaining`
                  : "Free shipping unlocked"
              }
              className="shipping-progress__track"
              role="progressbar"
            >
              <span
                style={{
                  width: `${shippingProgress}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="cart-line-list">
          {lines.map(({ item, product, variant }) => (
            <article className="cart-line" key={`${product.id}:${variant.id}`}>
              <Link
                aria-label={`View ${product.name}`}
                className="cart-line__visual"
                href={`/products/${product.slug}`}
              >
                <ProductVisual compact decorative product={product} />
              </Link>
              <div className="cart-line__details">
                <div className="cart-line__top">
                  <div>
                    <p className="eyebrow">{product.eyebrow}</p>
                    <h2>
                      <Link href={`/products/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h2>
                    <p className="cart-line__variant">{variant.label}</p>
                  </div>
                  <strong>{formatPrice(product.price * item.quantity)}</strong>
                </div>

                <div className="cart-line__controls">
                  <div
                    aria-label={`Quantity for ${product.name}`}
                    className="quantity-control"
                    role="group"
                  >
                    <button
                      aria-label={`Decrease ${product.name} quantity`}
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        setQuantity(product.id, variant.id, item.quantity - 1)
                      }
                      type="button"
                    >
                      <Minus aria-hidden="true" size={15} />
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      aria-label={`Increase ${product.name} quantity`}
                      disabled={item.quantity >= maxQuantityPerLine}
                      onClick={() =>
                        setQuantity(product.id, variant.id, item.quantity + 1)
                      }
                      type="button"
                    >
                      <Plus aria-hidden="true" size={15} />
                    </button>
                  </div>
                  <button
                    aria-label={`Remove ${product.name} from cart`}
                    className="remove-button"
                    onClick={() => removeItem(product.id, variant.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <Link className="continue-shopping" href="/shop">
          <ArrowLeft aria-hidden="true" size={17} />
          Continue shopping
        </Link>
      </section>

      <aside aria-labelledby="summary-heading" className="order-summary">
        <p className="eyebrow">Summary</p>
        <h2 id="summary-heading">Order summary</h2>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          <div className="order-summary__total">
            <dt>Estimated total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="order-summary__note">
          Your final total is shown before you confirm payment.
        </p>

        {checkoutError ? (
          <div className="checkout-error" role="alert">
            <AlertCircle aria-hidden="true" size={18} />
            <p>{checkoutError}</p>
          </div>
        ) : null}

        <button
          className="button button--primary button--wide"
          disabled={checkoutPending}
          onClick={beginCheckout}
          type="button"
        >
          {checkoutPending ? (
            <>
              <LoaderCircle aria-hidden="true" className="spin" size={19} />
              Opening secure checkout
            </>
          ) : (
            <>
              <LockKeyhole aria-hidden="true" size={18} />
              Checkout securely
            </>
          )}
        </button>
        <p className="stripe-note">
          Payments are processed securely by Stripe.
        </p>
      </aside>
    </div>
  );
}
