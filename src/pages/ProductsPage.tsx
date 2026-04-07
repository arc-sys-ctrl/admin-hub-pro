import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  image?: string;
}

const mockProducts: Product[] = [
  { id: "1", name: "Silk Evening Dress", price: 4500, category: "Dresses", stock: 23, status: "active" },
  { id: "2", name: "Classic Leather Bag", price: 3200, category: "Bags", stock: 45, status: "active" },
  { id: "3", name: "Designer Sunglasses", price: 1800, category: "Accessories", stock: 0, status: "out_of_stock" },
  { id: "4", name: "Premium Watch", price: 12500, category: "Watches", stock: 12, status: "active" },
  { id: "5", name: "Casual Sneakers", price: 2800, category: "Shoes", stock: 67, status: "active" },
  { id: "6", name: "Summer Collection Top", price: 1500, category: "Tops", stock: 5, status: "draft" },
];

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-0",
  draft: "bg-muted text-muted-foreground border-0",
  out_of_stock: "bg-destructive/10 text-destructive border-0",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products] = useState<Product[]>(mockProducts);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="e.g. Silk Evening Dress" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (KSh)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g. Dresses" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Product description..." />
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload product image</p>
              </div>
              <Button className="w-full">Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
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
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-sm text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">KSh {product.price.toLocaleString()}</td>
                    <td className="p-4 text-sm text-foreground">{product.stock}</td>
                    <td className="p-4">
                      <Badge className={statusStyles[product.status]}>
                        {product.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
