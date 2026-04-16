import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  UserPlus,
  Search,
  Package,
  ShoppingCart,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
  Loader2,
  CheckCircle2,
  Smartphone,
  Globe,
  Store,
  CreditCard,
  Banknote,
  Phone,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/* ─────────── Types ─────────── */
interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  image_url?: string;
  stock: number;
  sizes?: string[];
  category_name?: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image_url?: string;
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/* ─────────── Step indicator ─────────── */
const STEPS = ["Customer", "Products", "Details", "Review"];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < current
                  ? "bg-primary text-primary-foreground"
                  : i === current
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium uppercase tracking-wider ${
                i === current ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 flex-1 mb-4 transition-colors ${
                i < current ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────── Channel / Payment pills ─────────── */
const CHANNELS = [
  { value: "website", label: "Website", icon: Globe },
  { value: "app", label: "App", icon: Smartphone },
  { value: "in_store", label: "In-Store", icon: Store },
];

const PAYMENT_METHODS = [
  { value: "mpesa", label: "M-Pesa", icon: Phone },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
];

/* ─────────── Main component ─────────── */
export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Customer
  const [customerMode, setCustomerMode] = useState<"existing" | "walkin">("existing");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [walkIn, setWalkIn] = useState({ name: "", email: "", phone: "" });

  // Step 2 — Products
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Step 3 — Details
  const [shippingAddress, setShippingAddress] = useState("");
  const [channel, setChannel] = useState("website");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [notes, setNotes] = useState("");

  /* ── fetch customers on search ── */
  const fetchCustomers = useCallback(async (q: string) => {
    setLoadingCustomers(true);
    try {
      const res = await api.get(`/users?search=${encodeURIComponent(q)}`);
      setCustomers(res.data);
    } catch {
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => fetchCustomers(customerSearch), 300);
    return () => clearTimeout(timer);
  }, [customerSearch, open, fetchCustomers]);

  /* ── fetch products on search ── */
  const fetchProducts = useCallback(async (q: string) => {
    setLoadingProducts(true);
    try {
      const res = await api.get(`/products/admin?search=${encodeURIComponent(q)}`);
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    const timer = setTimeout(() => fetchProducts(productSearch), 300);
    return () => clearTimeout(timer);
  }, [productSearch, step, fetchProducts]);

  /* ── load products when moving to step 1 ── */
  useEffect(() => {
    if (step === 1 && products.length === 0) fetchProducts("");
  }, [step, fetchProducts, products.length]);

  /* ── reset on close ── */
  const reset = () => {
    setStep(0);
    setCustomerMode("existing");
    setCustomerSearch("");
    setCustomers([]);
    setSelectedCustomer(null);
    setWalkIn({ name: "", email: "", phone: "" });
    setProductSearch("");
    setCart([]);
    setShippingAddress("");
    setChannel("website");
    setPaymentMethod("mpesa");
    setNotes("");
  };

  /* ── cart helpers ── */
  const addToCart = (product: Product) => {
    const exists = cart.find((c) => c.productId === product.id && c.size === "");
    if (exists) {
      setCart(cart.map((c) =>
        c.productId === product.id && c.size === ""
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: product.sizes?.[0] || "",
          image_url: product.image_url,
        },
      ]);
    }
  };

  const updateItem = (index: number, field: keyof CartItem, value: string | number) => {
    setCart(cart.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  /* ── step validation ── */
  const canProceed = () => {
    if (step === 0) {
      if (customerMode === "existing") return !!selectedCustomer;
      return !!walkIn.name && !!walkIn.email;
    }
    if (step === 1) return cart.length > 0;
    if (step === 2) return !!shippingAddress && !!channel && !!paymentMethod;
    return true;
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        customer_id: customerMode === "existing" ? selectedCustomer?.id : undefined,
        customer_name: customerMode === "existing" ? selectedCustomer?.full_name : walkIn.name,
        customer_email: customerMode === "existing" ? selectedCustomer?.email : walkIn.email,
        customer_phone: customerMode === "existing" ? selectedCustomer?.phone : walkIn.phone,
        items: cart.map((c) => ({
          productId: c.productId,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          size: c.size,
        })),
        shippingAddress,
        channel,
        paymentMethod,
        notes,
      };

      await api.post("/orders/admin", payload);
      toast({ title: "Order created successfully!", description: `Order placed via CRM for ${payload.customer_name}` });
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (err: any) {
      toast({
        title: "Failed to create order",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────── RENDER ─────────── */
  const customerDisplay =
    customerMode === "existing"
      ? selectedCustomer?.full_name
      : walkIn.name;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Create Order via CRM
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-5 overflow-y-auto flex-1">
          <StepBar current={step} />

          {/* ── STEP 0: Customer ── */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Mode toggle */}
              <div className="flex rounded-xl border border-border overflow-hidden">
                {[
                  { mode: "existing", icon: User, label: "Existing Customer" },
                  { mode: "walkin", icon: UserPlus, label: "Walk-in / Manual" },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => { setCustomerMode(mode as any); setSelectedCustomer(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                      customerMode === mode
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {customerMode === "existing" ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search customer by name or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    {loadingCustomers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : customers.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        No customers found. Try a different search.
                      </p>
                    ) : (
                      customers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCustomer(c)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
                            selectedCustomer?.id === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                          }`}
                        >
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {c.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{c.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                          </div>
                          {selectedCustomer?.id === c.id && (
                            <CheckCircle2 className="h-4 w-4 text-primary ml-auto shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  {selectedCustomer && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-primary">
                        Selected: {selectedCustomer.full_name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="e.g. John Kamau"
                        value={walkIn.name}
                        onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={walkIn.email}
                        onChange={(e) => setWalkIn({ ...walkIn, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone (optional)</Label>
                    <Input
                      placeholder="+254 7XX XXX XXX"
                      value={walkIn.phone}
                      onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1: Products ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              {/* Product catalog list */}
              <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No products found.</p>
                ) : (
                  products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <div className="h-9 w-9 rounded-lg bg-secondary overflow-hidden shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url.startsWith("http") ? p.image_url : `${import.meta.env.VITE_API_URL || ""}${p.image_url}`}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">KES {Number(p.price).toLocaleString()} · Stock: {p.stock}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-7 px-3 text-xs"
                        onClick={() => addToCart(p)}
                        disabled={p.stock === 0}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart */}
              {cart.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cart.map((item, i) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border">
                          <div className="h-9 w-9 rounded-lg bg-background overflow-hidden shrink-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url.startsWith("http") ? item.image_url : `${import.meta.env.VITE_API_URL || ""}${item.image_url}`}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-secondary rounded-lg">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">KES {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                          {/* Size picker */}
                          {product?.sizes && product.sizes.length > 0 && (
                            <Select value={item.size} onValueChange={(v) => updateItem(i, "size", v)}>
                              <SelectTrigger className="h-7 w-16 text-xs">
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {product.sizes.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {/* Quantity */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => item.quantity > 1 ? updateItem(i, "quantity", item.quantity - 1) : removeItem(i)}
                              className="h-6 w-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateItem(i, "quantity", item.quantity + 1)}
                              className="h-6 w-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(i)}
                            className="h-6 w-6 text-destructive hover:text-destructive/80 transition-colors shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-base font-bold text-foreground">KES {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
                  <ShoppingCart className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Search and add products above</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Details ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Shipping Address *
                </Label>
                <Textarea
                  placeholder="e.g. 45 Ngong Road, Nairobi, Kenya"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Order Channel *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNELS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setChannel(value)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                        channel === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setPaymentMethod(value)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                        paymentMethod === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Internal Notes (optional)</Label>
                <Textarea
                  placeholder="e.g. Customer called in, priority delivery requested..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Customer */}
              <div className="rounded-xl border border-border p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Customer</p>
                <p className="font-semibold text-foreground">{customerDisplay}</p>
                <p className="text-sm text-muted-foreground">
                  {customerMode === "existing" ? selectedCustomer?.email : walkIn.email}
                </p>
                {(customerMode === "existing" ? selectedCustomer?.phone : walkIn.phone) && (
                  <p className="text-sm text-muted-foreground">
                    {customerMode === "existing" ? selectedCustomer?.phone : walkIn.phone}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Items ({cart.length})</p>
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {item.name}
                      {item.size && <span className="text-muted-foreground ml-1">({item.size})</span>}
                      {" × "}
                      {item.quantity}
                    </span>
                    <span className="font-semibold">KES {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">KES {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Logistics */}
              <div className="rounded-xl border border-border p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Channel</p>
                  <div className="flex items-center gap-1.5">
                    {channel === "website" && <Globe className="h-3.5 w-3.5 text-primary" />}
                    {channel === "app" && <Smartphone className="h-3.5 w-3.5 text-primary" />}
                    {channel === "in_store" && <Store className="h-3.5 w-3.5 text-primary" />}
                    <span className="capitalize font-medium">{channel.replace("_", " ")}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Payment</p>
                  <div className="flex items-center gap-1.5">
                    {paymentMethod === "mpesa" && <Phone className="h-3.5 w-3.5 text-primary" />}
                    {paymentMethod === "cash" && <Banknote className="h-3.5 w-3.5 text-primary" />}
                    {paymentMethod === "card" && <CreditCard className="h-3.5 w-3.5 text-primary" />}
                    <span className="capitalize font-medium">{paymentMethod}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Ship to</p>
                  <p className="font-medium">{shippingAddress}</p>
                </div>
                {notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Notes</p>
                    <p className="text-muted-foreground italic">{notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer navigation ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0 bg-background">
          <Button
            variant="ghost"
            onClick={() => step === 0 ? onOpenChange(false) : setStep(step - 1)}
          >
            {step === 0 ? "Cancel" : <><ChevronLeft className="h-4 w-4 mr-1" /> Back</>}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary text-primary-foreground min-w-36"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing Order...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Place Order</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
