import { getCategory, products, type Product } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export const returnPolicyId = `${siteConfig.url}/policies/returns#return-policy`;
export const shippingServiceId = `${siteConfig.url}/policies/shipping#standard-shipping`;
export const storeId = `${siteConfig.url}#store`;

const businessDays = [
  "https://schema.org/Monday",
  "https://schema.org/Tuesday",
  "https://schema.org/Wednesday",
  "https://schema.org/Thursday",
  "https://schema.org/Friday",
] as const;

function dollars(cents: number): number {
  return cents / 100;
}

export function returnPolicyStructuredData() {
  return {
    "@type": "MerchantReturnPolicy",
    "@id": returnPolicyId,
    applicableCountry: siteConfig.shippingCountry,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: siteConfig.returnWindowDays,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  };
}

export function shippingServiceStructuredData() {
  const freeShippingMinimum = dollars(siteConfig.freeShippingThreshold);
  const standardShipping = dollars(siteConfig.standardShippingAmount);
  const transitTime = {
    "@type": "ServicePeriod",
    businessDays,
    duration: {
      "@type": "QuantitativeValue",
      minValue: siteConfig.standardDeliveryDays.minimum,
      maxValue: siteConfig.standardDeliveryDays.maximum,
      unitCode: "DAY",
    },
  };

  return {
    "@type": "ShippingService",
    "@id": shippingServiceId,
    name: "Standard US shipping",
    description: `Orders ship to the United States. Standard delivery is ${siteConfig.standardDeliveryDays.minimum}–${siteConfig.standardDeliveryDays.maximum} business days after dispatch. Shipping is free from ${freeShippingMinimum} USD and ${standardShipping} USD below that.`,
    fulfillmentType: "https://schema.org/FulfillmentTypeDelivery",
    handlingTime: {
      "@type": "ServicePeriod",
      businessDays,
      duration: {
        "@type": "QuantitativeValue",
        minValue: siteConfig.orderPreparationDays.minimum,
        maxValue: siteConfig.orderPreparationDays.maximum,
        unitCode: "DAY",
      },
    },
    shippingConditions: [
      {
        "@type": "ShippingConditions",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: siteConfig.shippingCountry,
        },
        orderValue: {
          "@type": "MonetaryAmount",
          minValue: 0,
          maxValue: Number((freeShippingMinimum - 0.01).toFixed(2)),
          currency: siteConfig.currency,
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: standardShipping,
          currency: siteConfig.currency,
        },
        transitTime,
      },
      {
        "@type": "ShippingConditions",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: siteConfig.shippingCountry,
        },
        orderValue: {
          "@type": "MonetaryAmount",
          minValue: freeShippingMinimum,
          currency: siteConfig.currency,
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: siteConfig.currency,
        },
        transitTime,
      },
    ],
  };
}

function storeEntity() {
  return {
    "@type": "OnlineStore",
    "@id": storeId,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    currenciesAccepted: siteConfig.currency,
  };
}

export function storeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...storeEntity(),
        hasMerchantReturnPolicy: { "@id": returnPolicyId },
        hasShippingService: { "@id": shippingServiceId },
      },
      returnPolicyStructuredData(),
      shippingServiceStructuredData(),
    ],
  };
}

export function returnPolicyPageStructuredData() {
  return {
    "@context": "https://schema.org",
    ...storeEntity(),
    hasMerchantReturnPolicy: returnPolicyStructuredData(),
  };
}

export function shippingPolicyPageStructuredData() {
  return {
    "@context": "https://schema.org",
    ...storeEntity(),
    hasShippingService: shippingServiceStructuredData(),
  };
}

export function collectionStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DopaBerry mobile accessories",
    description:
      "Colorful iPhone cases, AirPods cases, charms, grips, and mobile extras.",
    url: `${siteConfig.url}/shop`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: `${siteConfig.url}/products/${product.slug}`,
      })),
    },
  };
}

export function productStructuredData(product: Product) {
  const category = getCategory(product.category);
  const productUrl = `${siteConfig.url}/products/${product.slug}`;
  const availability = {
    in_stock: "https://schema.org/InStock",
    preorder: "https://schema.org/PreOrder",
    out_of_stock: "https://schema.org/OutOfStock",
  }[product.availability];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        url: productUrl,
        name: product.name,
        description: product.description,
        sku: product.id,
        category: category?.name,
        image: [`${productUrl}/opengraph-image`],
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: siteConfig.currency,
          price: (product.price / 100).toFixed(2),
          availability,
          itemCondition: "https://schema.org/NewCondition",
          hasMerchantReturnPolicy: { "@id": returnPolicyId },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            hasShippingService: { "@id": shippingServiceId },
          },
        },
      },
      returnPolicyStructuredData(),
      shippingServiceStructuredData(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Shop",
            item: `${siteConfig.url}/shop`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: category?.name ?? "Collection",
            item: `${siteConfig.url}/shop?category=${product.category}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
  };
}
