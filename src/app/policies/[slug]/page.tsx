import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { formatPrice } from "@/lib/currency";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import {
  returnPolicyPageStructuredData,
  shippingPolicyPageStructuredData,
} from "@/lib/structured-data";

interface PolicySection {
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
}

interface Policy {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly updatedOn: string;
  readonly sections: readonly PolicySection[];
}

export const policies: readonly Policy[] = [
  {
    slug: "shipping",
    title: "Shipping policy",
    description:
      "Where DopaBerry ships, what delivery costs, and when to expect your order.",
    updatedOn: "2026-08-14",
    sections: [
      {
        heading: "Where we ship",
        paragraphs: [
          "DopaBerry currently ships to valid residential and business addresses within the United States. We do not currently ship to freight forwarders or internationally.",
        ],
      },
      {
        heading: "Processing and delivery",
        bullets: [
          `Orders are typically prepared within ${siteConfig.orderPreparationDays.minimum}–${siteConfig.orderPreparationDays.maximum} business days, excluding holidays.`,
          `Standard delivery is estimated at ${siteConfig.standardDeliveryDays.minimum}–${siteConfig.standardDeliveryDays.maximum} business days after dispatch.`,
          "Delivery windows are estimates, not guarantees. Carrier, weather, and high-volume delays may occur.",
          `Contact ${siteConfig.email} with the order reference from your confirmation page if you need a status update.`,
        ],
      },
      {
        heading: "Rates",
        paragraphs: [
          `Standard US shipping is free when the merchandise subtotal reaches ${formatPrice(siteConfig.freeShippingThreshold)} before promotion codes and taxes. A ${formatPrice(siteConfig.standardShippingAmount)} standard shipping fee applies below that threshold.`,
        ],
      },
      {
        heading: "Addresses and delivery issues",
        paragraphs: [
          "Please check your address before payment. Contact us immediately if it needs correction; we cannot guarantee changes after fulfillment begins. If tracking shows a package as delivered but it is missing, check the delivery area and contact the carrier before reaching out to us.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns and refunds",
    description: `DopaBerry's ${siteConfig.returnWindowDays}-day return window, eligibility rules, and refund timing.`,
    updatedOn: "2026-08-14",
    sections: [
      {
        heading: `${siteConfig.returnWindowDays}-day return window`,
        paragraphs: [
          `You may request a return within ${siteConfig.returnWindowDays} calendar days of delivery. Items must be unused, undamaged, and returned with their original packaging and included accessories.`,
        ],
      },
      {
        heading: "Starting a return",
        paragraphs: [
          `Email ${siteConfig.email} with your order reference and the item you want to return. Wait for return instructions before sending anything; returns sent without authorization may be delayed or refused.`,
        ],
      },
      {
        heading: "Return shipping",
        paragraphs: [
          "Customers are responsible for return shipping unless an item arrived damaged, defective, or incorrect. Original shipping fees are not refundable. Use a tracked service, as DopaBerry cannot refund a return that does not arrive.",
        ],
      },
      {
        heading: "Damaged or incorrect items",
        paragraphs: [
          "Contact us within 7 days of delivery with your order reference and clear photos of the item and packaging. We will review the issue and, when approved, arrange a replacement or refund at no additional shipping cost.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          "Approved refunds are issued to the original payment method after inspection. Banks and card issuers typically take 5–10 business days to post the credit. Items marked final sale at purchase are not returnable unless defective.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    description:
      "How DopaBerry collects, uses, protects, and shares personal information.",
    updatedOn: "2026-10-24",
    sections: [
      {
        heading: "Information we collect",
        bullets: [
          "Contact and delivery information, such as your name, email, phone number, and shipping address.",
          "Checkout information available through Stripe, including products, transaction status, discounts, and the Stripe session reference.",
          "Messages you send to customer support.",
          "Technical information needed to operate and secure the site, such as device, browser, and IP address.",
        ],
      },
      {
        heading: "Payments",
        paragraphs: [
          "Payments are processed by Stripe. DopaBerry does not store complete card numbers or card security codes. Stripe processes payment information under its own privacy policy and security standards.",
        ],
      },
      {
        heading: "How we use information",
        bullets: [
          "Process, deliver, support, and refund orders.",
          "Communicate transactional updates and respond to requests.",
          "Prevent fraud, abuse, and security incidents.",
          "Maintain and improve site reliability and the shopping experience.",
          "Meet tax, accounting, legal, and regulatory obligations.",
        ],
      },
      {
        heading: "How we share information",
        paragraphs: [
          "We share information only as needed with service providers that operate the storefront, process payments, host infrastructure, deliver packages, or provide professional services. We may also disclose information when legally required or during a business transaction. DopaBerry does not sell personal information.",
        ],
      },
      {
        heading: "Storage and your choices",
        paragraphs: [
          "The site uses local browser storage to keep your cart. Stripe retains checkout transaction records under its retention practices, and DopaBerry may access those records for support, legal obligations, disputes, and security. You may request access, correction, or deletion of eligible personal information by contacting us.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `For privacy questions or requests, email ${siteConfig.email}. We may need to verify your identity before completing a request.`,
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of service",
    description:
      "The terms that apply when you browse or purchase from DopaBerry.",
    updatedOn: "2026-08-14",
    sections: [
      {
        heading: "Using this site",
        paragraphs: [
          "By using DopaBerry or placing an order, you agree to these terms and the policies linked from them. You must be legally able to enter a purchase agreement and provide accurate billing, contact, and delivery information.",
        ],
      },
      {
        heading: "Products and availability",
        paragraphs: [
          "We aim to describe product fit, color, materials, and features accurately. Screen colors vary, and minor visual differences may occur. Products, pricing, promotions, and availability may change without notice.",
        ],
      },
      {
        heading: "Orders and payment",
        paragraphs: [
          "An order confirmation acknowledges your request; it does not guarantee acceptance. We may cancel or limit an order for stock errors, suspected fraud, pricing errors, or legal restrictions and will refund any captured amount. Stripe securely processes payment.",
        ],
      },
      {
        heading: "Compatibility",
        paragraphs: [
          "You are responsible for choosing the correct device model and checking compatibility before purchase. Product names referring to Apple devices indicate compatibility only; DopaBerry is not affiliated with or endorsed by Apple Inc.",
        ],
      },
      {
        heading: "Brand and content",
        paragraphs: [
          "DopaBerry names, artwork, copy, graphics, and site content are owned by or licensed to DopaBerry and may not be copied, resold, scraped, or used commercially without written permission.",
        ],
      },
      {
        heading: "Responsible use",
        paragraphs: [
          "Do not interfere with site operation, attempt unauthorized access, submit fraudulent orders, introduce malicious code, or use the site in violation of law. We may restrict access when reasonably necessary to protect customers or the service.",
        ],
      },
      {
        heading: "No health claims",
        paragraphs: [
          "References to dopamine, serotonin, mood, happiness, or similar ideas are creative product and brand language. DopaBerry products are not medical devices and are not intended to diagnose, treat, cure, or prevent any condition.",
        ],
      },
      {
        heading: "Limits and changes",
        paragraphs: [
          "To the extent permitted by law, the site and products are provided without warranties beyond those that cannot legally be excluded. DopaBerry is not responsible for indirect or consequential loss. We may update these terms; the date above identifies the latest revision.",
        ],
      },
    ],
  },
] as const;

export function formatPolicyDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}

function getPolicy(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ readonly slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);

  return policy
    ? createPageMetadata({
        path: `/policies/${policy.slug}`,
        title: policy.title,
        description: policy.description,
      })
    : { title: "Policy not found" };
}

export default async function PolicyPage({
  params,
}: {
  readonly params: Promise<{ readonly slug: string }>;
}) {
  const { slug } = await params;
  const policy = getPolicy(slug);

  if (!policy) {
    notFound();
  }

  const policyStructuredData =
    policy.slug === "returns"
      ? returnPolicyPageStructuredData()
      : policy.slug === "shipping"
        ? shippingPolicyPageStructuredData()
        : null;

  return (
    <div className="page-shell">
      {policyStructuredData ? <JsonLd data={policyStructuredData} /> : null}
      <article className="shell policy">
        <header className="policy__header">
          <p className="eyebrow">Policies</p>
          <h1>{policy.title}</h1>
          <p>{policy.description}</p>
          <small>Last updated: {formatPolicyDate(policy.updatedOn)}</small>
        </header>

        <div className="policy__body">
          <nav aria-label="Policy sections" className="policy__nav">
            <p>On this page</p>
            {policy.sections.map((section, index) => (
              <a href={`#section-${index + 1}`} key={section.heading}>
                {section.heading}
              </a>
            ))}
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/terms">Terms</Link>
          </nav>

          <div className="policy__content">
            {policy.sections.map((section, index) => (
              <section id={`section-${index + 1}`} key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="policy__contact">
              <h2>Questions?</h2>
              <p>
                Email{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>{" "}
                and we&apos;ll help.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
