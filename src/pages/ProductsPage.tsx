import { useState, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-0",
  draft: "bg-muted text-muted-foreground border-0",
  out_of_stock: "bg-destructive/10 text-destructive border-0",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category: "", status: "draft" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let image_url = editingProduct?.image_url || null;

      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
        category: form.category,
        status: form.status,
        image_url,
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: editingProduct ? "Product updated" : "Product added" });
      resetForm();
      setDialogOpen(false);
      setUploading(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
  });

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "", category: "", status: "draft" });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
      status: product.status,
    });
    setImagePreview(product.image_url);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="e.g. Silk Evening Dress" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (KSh)</Label>
                  <Input type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input placeholder="e.g. Dresses" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Product Image</Label>
                <label className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors block">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg mx-auto" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload product image</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-muted-foreground">
                        No products yet. Click "Add Product" to get started.
                      </td>
                    </tr>
                  ) : filtered.map((product: any) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded-lg" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium text-sm text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{product.category || "—"}</td>
                      <td className="p-4 text-sm font-semibold text-foreground">KSh {Number(product.price).toLocaleString()}</td>
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
        </CardContent>
      </Card>
    </div>
  );
}
