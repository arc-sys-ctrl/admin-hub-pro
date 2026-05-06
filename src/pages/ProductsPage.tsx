import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-0",
  draft: "bg-muted text-muted-foreground border-0",
  out_of_stock: "bg-destructive/10 text-destructive border-0",
};

const PAGE_SIZE = 25;

function resolveMediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiBase = String(import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
  const origin = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ 
    name: "", 
    brand: "",
    description: "", 
    price: "", 
    original_price: "",
    stock: "", 
    category_name: "",
    category_id: "",
    status: "active",
    sizes: "",
    vendor: "",
    is_new: false,
    is_trending: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: catalog = { products: [] as any[], total: 0 }, isLoading } = useQuery({
    queryKey: ["admin-products", page, search.trim()],
    queryFn: async () => {
      const response = await api.get("/products/admin", {
        params: {
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });
      const raw = response.headers["x-total-count"];
      const total = parseInt(typeof raw === "string" ? raw : String(raw ?? "0"), 10);
      return {
        products: Array.isArray(response.data) ? response.data : [],
        total: Number.isFinite(total) ? total : 0,
      };
    },
  });

  const products = catalog.products;
  const totalCount = catalog.total;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("brand", form.brand);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("original_price", form.original_price);
      formData.append("stock", form.stock);
      formData.append("category_name", form.category_name);
      if (form.category_id) {
        formData.append("category_id", form.category_id);
      }
      formData.append("status", form.status);
      formData.append("vendor", form.vendor);
      formData.append("is_new", String(form.is_new));
      formData.append("is_trending", String(form.is_trending));
      
      const sizesArray = form.sizes.split(",").map(s => s.trim()).filter(s => s !== "");
      formData.append("sizes", JSON.stringify(sizesArray));

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (editingProduct?.image_url) {
        formData.append("image_url", editingProduct.image_url);
      }

      additionalFiles.forEach(file => {
        formData.append("images", file);
      });

      if (editingProduct) {
        // For updates, we might want to keep existing additional images
        if (editingProduct.image_urls) {
          formData.append("image_urls", JSON.stringify(editingProduct.image_urls));
        }
        // Let axios set multipart boundary automatically (manual Content-Type breaks uploads)
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post("/products", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: editingProduct ? "Product updated" : "Product added" });
      resetForm();
      setDialogOpen(false);
      setUploading(false);
    },
    onError: (err: any) => {
      const d = err.response?.data;
      const msg = d?.message || d?.error || err.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product deleted" });
    },
  });

  const resetForm = () => {
    setForm({ 
      name: "", 
      brand: "",
      description: "", 
      price: "", 
      original_price: "",
      stock: "", 
      category_name: "",
      category_id: "",
      status: "active",
      sizes: "",
      vendor: "",
      is_new: false,
      is_trending: false
    });
    setImageFile(null);
    setImagePreview(null);
    setAdditionalFiles([]);
    setAdditionalPreviews([]);
    setEditingProduct(null);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand || "",
      description: product.description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      stock: product.stock.toString(),
      category_name: product.category_name || "",
      category_id: product.category_id || "",
      status: product.status,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
      vendor: product.vendor || "",
      is_new: !!product.is_new,
      is_trending: !!product.is_trending,
    });
    setImagePreview(product.image_url ? resolveMediaUrl(product.image_url) : null);
    
    if (product.image_urls && Array.isArray(product.image_urls)) {
      setAdditionalPreviews(product.image_urls.map((url: string) => resolveMediaUrl(url)));
    }
    
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setAdditionalPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingProduct && !imageFile) {
                  toast({
                    title: "Main image required",
                    description: "Choose a main product photo from your computer before saving a new product.",
                    variant: "destructive",
                  });
                  return;
                }
                saveMutation.mutate();
              }}
              className="space-y-4 pt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g. Silk Evening Dress" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input placeholder="e.g. Sophix" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (KSh)</Label>
                  <Input type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (Optional)</Label>
                  <Input type="number" placeholder="0" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={form.category_name} 
                    onValueChange={(v) => {
                      const cat = categories.find((c: any) => c.name === v);
                      setForm({
                        ...form,
                        category_name: v,
                        category_id: cat?.id ?? "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (hidden in app)</SelectItem>
                      <SelectItem value="active">Active (visible in app)</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Only <strong>Active</strong> products appear in the storefront and mobile app.</p>
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input placeholder="e.g. STRT.CO" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sizes (comma separated)</Label>
                <Input placeholder="e.g. S, M, L, XL" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
              </div>

              <div className="flex items-center gap-8 py-2">
                <div className="flex items-center space-x-2">
                  <Switch id="is_new" checked={form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} />
                  <Label htmlFor="is_new">New Arrival</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_trending" checked={form.is_trending} onCheckedChange={(v) => setForm({ ...form, is_trending: v })} />
                  <Label htmlFor="is_trending">Trending</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Main Image {!editingProduct && <span className="text-destructive">*</span>}</Label>
                  <label className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors block h-40">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg mx-auto" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Main Product Image</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <Label>Additional Images</Label>
                  <div className="grid grid-cols-2 gap-2 h-40 overflow-y-auto pr-1">
                    {additionalPreviews.map((p, i) => (
                      <div key={i} className="relative h-16 w-full group">
                        <img src={p} className="h-full w-full object-cover rounded-md" />
                      </div>
                    ))}
                    <label className="border-2 border-dashed border-border rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors h-16">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-muted-foreground">
                        {search.trim()
                          ? "No products match this search."
                          : 'No products yet. Click "Add Product" to get started.'}
                      </td>
                    </tr>
                  ) : products.map((product: any) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                            {product.image_url ? (
                              <img 
                                src={resolveMediaUrl(product.image_url)} 
                                alt={product.name} 
                                className="h-10 w-10 object-cover rounded-lg" 
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-foreground">{product.name}</div>
                            {product.brand && <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">{product.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{product.category_name || "—"}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">KSh {Number(product.price).toLocaleString()}</span>
                          {product.original_price && Number(product.original_price) > Number(product.price) && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground line-through">KSh {Number(product.original_price).toLocaleString()}</span>
                              <span className="text-[10px] text-success font-medium">-{Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)}%</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">{product.stock}</td>
                      <td className="p-4">
                        <Badge className={statusStyles[product.status] || ""}>{product.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} · {totalCount} products
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

