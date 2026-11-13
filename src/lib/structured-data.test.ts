import { describe, expect, it } from "vitest";

import { products } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";
import {
  productStructuredData,
  returnPolicyStructuredData,
  shippingServiceStructuredData,
} from "@/lib/structured-data";

describe("merchant structured data", () => {
  it("publishes the 30-day mail return policy", () => {
    expect(returnPolicyStructuredData()).toMatchObject({
      applicableCountry: "US",
      merchantReturnDays: siteConfig.returnWindowDays,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    });
  });

  it("splits US shipping at the free-shipping threshold", () => {
    const service = shippingServiceStructuredData();
    const [paidShipping, freeShipping] = service.shippingConditions;

    expect(paidShipping?.shippingRate).toMatchObject({
      value: siteConfig.standardShippingAmount / 100,
    });
    expect(paidShipping?.orderValue).toMatchObject({ maxValue: 49.99 });
    expect(freeShipping?.shippingRate).toMatchObject({ value: 0 });
    expect(freeShipping?.orderValue).toMatchObject({ minValue: 50 });
    expect(service.handlingTime.duration).toMatchObject({
      minValue: siteConfig.orderPreparationDays.minimum,
      maxValue: siteConfig.orderPreparationDays.maximum,
    });
  });

  it("points product offers at the shared shipping and return policies", () => {
    const product = products[0];
    expect(product).toBeDefined();
    if (!product) {
      return;
    }

    const structuredData = productStructuredData(product);
    const productNode = structuredData["@graph"].find(
      (entry) => entry["@type"] === "Product",
    );
    const offer =
      productNode && "offers" in productNode ? productNode.offers : undefined;

    expect(offer).toMatchObject({
      price: (product.price / 100).toFixed(2),
      hasMerchantReturnPolicy: {
        "@id": `${siteConfig.url}/policies/returns#return-policy`,
      },
      shippingDetails: {
        hasShippingService: {
          "@id": `${siteConfig.url}/policies/shipping#standard-shipping`,
        },
      },
    });
    expect(structuredData["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ "@id": returnPolicyStructuredData()["@id"] }),
        expect.objectContaining({
          "@id": shippingServiceStructuredData()["@id"],
        }),
      ]),
    );
  });
});
