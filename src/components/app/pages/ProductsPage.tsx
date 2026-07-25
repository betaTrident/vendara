import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/app/layout/PageHeader";
import { DeleteProductDialog } from "@/components/app/products/DeleteProductDialog";
import { ProductCards } from "@/components/app/products/ProductCards";
import { ProductFilters } from "@/components/app/products/ProductFilters";
import {
  emptyProductForm,
  ProductFormPanel,
  type ProductFormState,
} from "@/components/app/products/ProductFormPanel";
import { ProductMetrics } from "@/components/app/products/ProductMetrics";
import { ProductTable } from "@/components/app/products/ProductTable";
import { Button } from "@/components/ui/button";
import { buildAdminHref } from "@/lib/admin/routes";
import { fetchAdminJson } from "@/lib/client/api";
import {
  DEFAULT_PRODUCT_PAGE_SIZE,
  filterProducts,
  paginateItems,
  summarizeProductCatalog,
} from "@/lib/domain/pricing";
import type { Product } from "@/lib/types";

interface ProductsPageProps {
  onNavigate: (href: string) => void;
  onStatsChange?: () => void;
  initialProductId?: string;
}

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [breakpointPx]);

  return isMobile;
}

export function ProductsPage({
  onNavigate,
  onStatsChange,
  initialProductId,
}: ProductsPageProps) {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lowMarkupOnly, setLowMarkupOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = async () => {
    setLoadError(null);
    try {
      const data = await fetchAdminJson<Product[]>("/api/products");
      setProducts(data);
      onStatsChange?.();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load products.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    if (!initialProductId || products.length === 0) {
      return;
    }
    const match = products.find((product) => product.id === initialProductId);
    if (match) {
      setForm({
        id: match.id,
        name: match.name,
        costPrice: String(match.costPrice),
        sellingPrice: String(match.sellingPrice),
        note: match.note ?? "",
      });
      setFormOpen(true);
    }
  }, [initialProductId, products]);

  const filtered = useMemo(
    () => filterProducts(products, { search, lowMarkupOnly }),
    [products, search, lowMarkupOnly],
  );

  const paged = useMemo(
    () => paginateItems(filtered, page, DEFAULT_PRODUCT_PAGE_SIZE),
    [filtered, page],
  );

  const summary = useMemo(() => summarizeProductCatalog(products), [products]);

  useEffect(() => {
    setPage(1);
  }, [search, lowMarkupOnly]);

  const openCreate = () => {
    setForm(emptyProductForm);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      note: product.note ?? "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: form.name,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        note: form.note || null,
      };

      if (form.id) {
        await fetchAdminJson(`/api/products/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAdminJson("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setForm(emptyProductForm);
      setFormOpen(false);
      await loadProducts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetchAdminJson(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadProducts();
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilters = Boolean(search.trim()) || lowMarkupOnly;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage catalog pricing, markup, and price history for your store."
        actions={
          <Button
            id="add-product-btn"
            type="button"
            onClick={openCreate}
            className="h-11 px-4 rounded-md font-semibold text-xs"
          >
            <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
            Add Product
          </Button>
        }
      />

      <ProductMetrics summary={summary} loading={loading} />

      <ProductFilters
        search={search}
        lowMarkupOnly={lowMarkupOnly}
        onSearchChange={setSearch}
        onLowMarkupOnlyChange={setLowMarkupOnly}
      />

      {loadError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {loadError}
        </div>
      ) : null}

      <ProductTable
        products={paged.items}
        totalCount={paged.total}
        hasFilters={hasFilters}
        search={search}
        page={paged.page}
        totalPages={paged.totalPages}
        onEdit={openEdit}
        onHistory={(product) =>
          onNavigate(
            buildAdminHref({
              name: "product-price-history",
              productId: product.id,
            }),
          )
        }
        onDelete={setDeleteTarget}
        onAdd={openCreate}
        onClearFilters={() => {
          setSearch("");
          setLowMarkupOnly(false);
        }}
        onPageChange={setPage}
      />

      <ProductCards
        products={paged.items}
        totalCount={paged.total}
        hasFilters={hasFilters}
        search={search}
        page={paged.page}
        totalPages={paged.totalPages}
        onEdit={openEdit}
        onHistory={(product) =>
          onNavigate(
            buildAdminHref({
              name: "product-price-history",
              productId: product.id,
            }),
          )
        }
        onDelete={setDeleteTarget}
        onAdd={openCreate}
        onClearFilters={() => {
          setSearch("");
          setLowMarkupOnly(false);
        }}
        onPageChange={setPage}
      />

      <ProductFormPanel
        open={formOpen}
        form={form}
        isSaving={isSaving}
        isMobile={isMobile}
        onOpenChange={setFormOpen}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <DeleteProductDialog
        open={Boolean(deleteTarget)}
        productName={deleteTarget?.name ?? null}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />
    </div>
  );
}
