"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type SearchResult = {
  id: string | number;
  title: string;
  subtitle?: string;
  type: string;
  href: string;
};

type ApiItem = Record<string, unknown>;

const SEARCH_CONFIG = [
  {
    endpoint: "/vehicles",
    type: "Vehicle",
    href: "/vehicles",
    getTitle: (item: ApiItem) =>
      String(
        item.plateNumber ??
          item.registrationNumber ??
          item.name ??
          `Vehicle #${item.id}`,
      ),
    getSubtitle: (item: ApiItem) =>
      String(
        item.model ??
          item.make ??
          item.status ??
          "",
      ),
  },
  {
    endpoint: "/drivers",
    type: "Driver",
    href: "/drivers",
    getTitle: (item: ApiItem) =>
      String(
        item.name ??
          `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() ??
          `Driver #${item.id}`,
      ),
    getSubtitle: (item: ApiItem) =>
      String(
        item.phone ??
          item.status ??
          "",
      ),
  },
  {
    endpoint: "/customers",
    type: "Customer",
    href: "/customers",
    getTitle: (item: ApiItem) =>
      String(
        item.name ??
          item.companyName ??
          `Customer #${item.id}`,
      ),
    getSubtitle: (item: ApiItem) =>
      String(
        item.phone ??
          item.email ??
          "",
      ),
  },
  {
    endpoint: "/suppliers",
    type: "Supplier",
    href: "/suppliers",
    getTitle: (item: ApiItem) =>
      String(
        item.name ??
          `Supplier #${item.id}`,
      ),
    getSubtitle: (item: ApiItem) =>
      String(
        item.phone ??
          item.email ??
          "",
      ),
  },
  {
    endpoint: "/products",
    type: "Product",
    href: "/products",
    getTitle: (item: ApiItem) =>
      String(
        item.name ??
          item.productName ??
          `Product #${item.id}`,
      ),
    getSubtitle: (item: ApiItem) =>
      String(
        item.sku ??
          item.code ??
          "",
      ),
  },
  {
    endpoint: "/purchases",
    type: "Purchase",
    href: "/purchases",
    getTitle: (item: ApiItem) =>
      String(
        item.referenceNumber ??
          `Purchase #${item.id}`,
      ),
    getSubtitle: (item: ApiItem) =>
      String(
        item.status ??
          item.purchaseDate ??
          "",
      ),
  },
  {
    endpoint: "/sales-orders",
    type: "Sales Order",
    href: "/sales-orders",
    getTitle: (item: ApiItem) =>
      String(
        item.orderNumber ??
          item.referenceNumber ??
          `Order #${item.id}`,
      ),
    getSubtitle: (item: ApiItem) =>
      String(
        item.status ??
          item.orderDate ??
          "",
      ),
  },
];

function itemMatchesSearch(
  item: ApiItem,
  query: string,
) {
  const searchableText = Object.values(item)
    .filter(
      (value) =>
        typeof value === "string" ||
        typeof value === "number",
    )
    .join(" ")
    .toLowerCase();

  return searchableText.includes(
    query.toLowerCase(),
  );
}

export default function GlobalSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    SearchResult[]
  >([]);
  const [loading, setLoading] =
    useState(false);
  const [open, setOpen] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  useEffect(() => {
    function handleKeyboard(
      event: KeyboardEvent,
    ) {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        const input =
          containerRef.current?.querySelector(
            "input",
          ) as HTMLInputElement | null;

        input?.focus();
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(
      async () => {
        setLoading(true);

        try {
          const responses =
            await Promise.allSettled(
              SEARCH_CONFIG.map((config) =>
                apiFetch(config.endpoint),
              ),
            );

          const searchResults: SearchResult[] =
            [];

          responses.forEach(
            (response, index) => {
              if (
                response.status !==
                "fulfilled"
              ) {
                return;
              }

              const config =
                SEARCH_CONFIG[index];

              const data =
                response.value;

              if (!Array.isArray(data)) {
                return;
              }

              data
                .filter((item) =>
                  itemMatchesSearch(
                    item as ApiItem,
                    query.trim(),
                  ),
                )
                .slice(0, 5)
                .forEach((item) => {
                  const apiItem =
                    item as ApiItem;

                  searchResults.push({
                    id: String(
                      apiItem.id ?? "",
                    ),
                    title:
                      config.getTitle(
                        apiItem,
                      ),
                    subtitle:
                      config.getSubtitle(
                        apiItem,
                      ),
                    type: config.type,
                    href: config.href,
                  });
                });
            },
          );

          setResults(
            searchResults.slice(0, 10),
          );

          setOpen(true);
        } finally {
          setLoading(false);
        }
      },
      300,
    );

    return () =>
      clearTimeout(timeout);
  }, [query]);

  function handleResultClick(
    result: SearchResult,
  ) {
    setQuery("");
    setResults([]);
    setOpen(false);

    router.push(result.href);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔎
        </span>

        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          onFocus={() => {
            if (query.trim()) {
              setOpen(true);
            }
          }}
          placeholder="Search FleetFlow..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-20 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-400">
          Ctrl K
        </div>
      </div>

      {open &&
        query.trim() && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            {loading ? (
              <div className="px-4 py-5 text-center text-sm text-slate-400">
                Searching FleetFlow...
              </div>
            ) : results.length ===
              0 ? (
              <div className="px-4 py-5 text-center">
                <div className="text-2xl">
                  🔎
                </div>

                <p className="mt-2 text-sm font-medium text-white">
                  No results found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try a vehicle,
                  driver, customer,
                  product, supplier,
                  or reference number.
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto py-2">
                {results.map(
                  (result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() =>
                        handleResultClick(
                          result,
                        )
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-800"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm">
                        {result.type ===
                        "Vehicle"
                          ? "🚚"
                          : result.type ===
                              "Driver"
                            ? "👤"
                            : result.type ===
                                "Customer"
                              ? "🏢"
                              : result.type ===
                                  "Supplier"
                                ? "📦"
                                : result.type ===
                                    "Product"
                                  ? "🛒"
                                  : result.type ===
                                      "Purchase"
                                    ? "📥"
                                    : "📋"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">
                          {
                            result.title
                          }
                        </div>

                        <div className="mt-0.5 flex gap-2 text-xs text-slate-500">
                          <span>
                            {
                              result.type
                            }
                          </span>

                          {result.subtitle && (
                            <>
                              <span>
                                •
                              </span>

                              <span className="truncate">
                                {
                                  result.subtitle
                                }
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="text-slate-600">
                        →
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
