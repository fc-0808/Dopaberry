"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Search } from "lucide-react";

import {
  categories,
  products,
  type CategorySlug,
  type Product,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

type CategoryFilter = CategorySlug | "all";
type SortOption = "featured" | "price-asc" | "price-desc" | "name";

function sortProducts(items: Product[], sort: SortOption): Product[] {
  return items.sort((left, right) => {
    switch (sort) {
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "name":
        return left.name.localeCompare(right.name);
      case "featured":
        return Number(right.featured) - Number(left.featured);
    }
  });
}

export function ShopClient({
  initialCategory,
}: {
  readonly initialCategory: CategoryFilter;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory =
        category === "all" || product.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${product.name} ${product.description} ${product.eyebrow}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    return sortProducts([...filtered], sort);
  }, [category, query, sort]);

  function resetFilters() {
    setCategory("all");
    setQuery("");
    setSort("featured");
    router.replace("/shop", { scroll: false });
  }

  function updateCategory(nextCategory: CategoryFilter) {
    setCategory(nextCategory);
    router.replace(
      nextCategory === "all" ? "/shop" : `/shop?category=${nextCategory}`,
      { scroll: false },
    );
  }

  return (
    <div className="shop-explorer">
      <div className="shop-toolbar">
        <div className="search-field">
          <Search aria-hidden="true" size={19} />
          <label className="sr-only" htmlFor="catalog-search">
            Search products
          </label>
          <input
            id="catalog-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the collection"
            type="search"
            value={query}
          />
        </div>

        <div className="sort-field">
          <ArrowUpDown aria-hidden="true" size={18} />
          <label className="sr-only" htmlFor="catalog-sort">
            Sort products
          </label>
          <select
            id="catalog-sort"
            onChange={(event) => setSort(event.target.value as SortOption)}
            value={sort}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div
        aria-label="Filter by category"
        className="filter-chips"
        role="group"
      >
        <button
          aria-pressed={category === "all"}
          className={category === "all" ? "is-active" : undefined}
          onClick={() => updateCategory("all")}
          type="button"
        >
          All
        </button>
        {categories.map((item) => (
          <button
            aria-pressed={category === item.slug}
            className={category === item.slug ? "is-active" : undefined}
            key={item.slug}
            onClick={() => updateCategory(item.slug)}
            type="button"
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="catalog-status" role="status">
        {visibleProducts.length}{" "}
        {visibleProducts.length === 1 ? "product" : "products"}
      </div>

      {visibleProducts.length > 0 ? (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No matches</h2>
          <p>Try a different search or bring the full collection back.</p>
          <button
            className="button button--secondary"
            onClick={resetFilters}
            type="button"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
