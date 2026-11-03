import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Trash2, Download, Image } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useInvoiceTemplates, InvoiceTemplate } from "@/hooks/use-invoice-templates";
import { TemplateManager } from "@/components/invoice/TemplateManager";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

const generateId = () => {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

export default function InvoicePage() {
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [watermark, setWatermark] = useState(false);
  const [invoiceId] = useState(generateId);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, price: 0 },
  ]);
  const previewRef = useRef<HTMLDivElement>(null);
  const { templates, saveTemplate, deleteTemplate, renameTemplate } = useInvoiceTemplates();

  const getFormData = (): InvoiceTemplate["data"] => ({
    userName, companyName, companyLogo, watermark, currency,
    clientName, clientEmail, notes, taxRate, discountType, discountValue, amountPaid, items,
  });

  const handleSaveTemplate = (name: string) => {
    saveTemplate(name, getFormData());
    toast.success(`Template "${name}" saved`);
  };

  const handleLoadTemplate = (template: InvoiceTemplate) => {
    const d = template.data;
    setUserName(d.userName);
    setCompanyName(d.companyName);
    setCompanyLogo(d.companyLogo);
    setWatermark(d.watermark);
    setCurrency(d.currency);
    setClientName(d.clientName);
    setClientEmail(d.clientEmail);
    setNotes(d.notes);
    setTaxRate(d.taxRate);
    setDiscountType(d.discountType);
    setDiscountValue(d.discountValue);
    setAmountPaid(d.amountPaid ?? d.due ?? 0);
    setItems(d.items);
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    toast.success("Template deleted");
  };

  const handleRenameTemplate = (id: string, newName: string) => {
    renameTemplate(id, newName);
    toast.success(`Template renamed to "${newName}"`);
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompanyLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", quantity: 1, price: 0 },
    ]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const discountAmount = discountType === "percent" ? subtotal * (discountValue / 100) : discountValue;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  const balanceDue = Math.max(0, total - (Number(amountPaid) || 0));
  const sym = currencies.find((c) => c.code === currency)?.symbol ?? "$";

  const capturePreview = useCallback(async () => {
    if (!previewRef.current) return null;
    return html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
  }, []);

  const downloadPDF = async () => {
    const canvas = await capturePreview();
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`${invoiceId}.pdf`);
  };

  const downloadImage = async (format: "png" | "jpeg") => {
    const canvas = await capturePreview();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${invoiceId}.${format === "jpeg" ? "jpg" : "png"}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Invoice Generator
        </h1>
        <p className="text-muted-foreground mt-1">Create and download professional invoices</p>
        <div className="mt-3">
          <TemplateManager
            templates={templates}
            onSave={handleSaveTemplate}
            onLoad={handleLoadTemplate}
            onDelete={handleDeleteTemplate}
            onRename={handleRenameTemplate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-5 pr-4">
            {/* Company Info */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Name</Label>
                  <Input placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input placeholder="Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div>
                  <Label>Company Logo</Label>
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Background Watermark</Label>
                  <Switch checked={watermark} onCheckedChange={setWatermark} />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} — {c.code} ({c.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Client Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Client Name</Label>
                  <Input placeholder="Client company or person" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div>
                  <Label>Client Email</Label>
                  <Input type="email" placeholder="client@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {idx === 0 && <Label className="text-xs text-muted-foreground">Description</Label>}
                      <Input
                        placeholder="Service or product"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      {idx === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div className="w-28">
                      {idx === 0 && <Label className="text-xs text-muted-foreground">Price</Label>}
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addItem} className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Tax & Discount */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Tax & Discount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      placeholder="0"
                      className="flex-1"
                    />
                    <Button
                      variant={discountType === "percent" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDiscountType("percent")}
                      className="w-12"
                    >
                      %
                    </Button>
                    <Button
                      variant={discountType === "fixed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDiscountType("fixed")}
                      className="w-12"
                    >
                      $
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Amount Paid</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Payment terms, thank you note, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* RIGHT: Preview + Download */}
        <div className="space-y-4">
          <div className="border border-border/50 rounded-xl overflow-hidden bg-white">
            <div
              ref={previewRef}
              className="p-8 relative"
              style={{ color: "#1a1a1a", fontFamily: "'Inter', sans-serif", minHeight: 600 }}
            >
              {/* Watermark */}
              {watermark && (companyLogo || companyName) && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
                  style={{ zIndex: 0 }}
                >
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt="Watermark"
                      style={{
                        maxWidth: 320,
                        maxHeight: 320,
                        objectFit: "contain",
                        opacity: 0.08,
                        userSelect: "none",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "6rem",
                        fontWeight: 800,
                        color: "rgba(0,0,0,0.04)",
                        transform: "rotate(-30deg)",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      {companyName}
                    </span>
                  )}
                </div>
              )}

              <div className="relative" style={{ zIndex: 1 }}>
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    {companyLogo && (
                      <img
                        src={companyLogo}
                        alt="Logo"
                        className="mb-3"
                        style={{ maxHeight: 60, maxWidth: 180, objectFit: "contain" }}
                      />
                    )}
                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                      {companyName || "Your Company"}
                    </h2>
                    <p style={{ fontSize: 13, color: "#666", margin: "2px 0" }}>
                      {userName || "Your Name"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f97316", margin: 0 }}>
                      INVOICE
                    </h1>
                    <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{invoiceId}</p>
                    <p style={{ fontSize: 13, color: "#666" }}>{today}</p>
                  </div>
                </div>

                {/* Bill To */}
                <div className="mb-6" style={{ padding: "12px 16px", background: "#f9fafb", borderRadius: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Bill To</p>
                  <p style={{ fontSize: 15, fontWeight: 600 }}>{clientName || "Client Name"}</p>
                  {clientEmail && <p style={{ fontSize: 13, color: "#666" }}>{clientEmail}</p>}
                </div>

                {/* Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#666" }}>Description</th>
                      <th style={{ textAlign: "center", padding: "8px 0", fontWeight: 600, color: "#666", width: 60 }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#666", width: 100 }}>Price</th>
                      <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#666", width: 100 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 0" }}>{item.description || "—"}</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ padding: "10px 0", textAlign: "right" }}>{sym}{item.price.toFixed(2)}</td>
                        <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 600 }}>
                          {sym}{(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mt-4">
                  <div style={{ width: 240 }}>
                    <div className="flex justify-between" style={{ padding: "6px 0", fontSize: 13 }}>
                      <span style={{ color: "#666" }}>Subtotal</span>
                      <span style={{ fontWeight: 600 }}>{sym}{subtotal.toFixed(2)}</span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex justify-between" style={{ padding: "6px 0", fontSize: 13 }}>
                        <span style={{ color: "#666" }}>
                          Discount {discountType === "percent" ? `(${discountValue}%)` : ""}
                        </span>
                        <span style={{ fontWeight: 600, color: "#ef4444" }}>-{sym}{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div className="flex justify-between" style={{ padding: "6px 0", fontSize: 13 }}>
                        <span style={{ color: "#666" }}>Tax ({taxRate}%)</span>
                        <span style={{ fontWeight: 600 }}>+{sym}{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div
                      className="flex justify-between"
                      style={{
                        padding: "10px 0",
                        borderTop: "2px solid #1a1a1a",
                        marginTop: 4,
                        fontSize: 16,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>Total</span>
                      <span style={{ fontWeight: 800, color: "#f97316" }}>{sym}{total.toFixed(2)}</span>
                    </div>
                    {amountPaid > 0 && (
                      <>
                        <div className="flex justify-between" style={{ padding: "6px 0", fontSize: 13 }}>
                          <span style={{ color: "#666" }}>Amount Paid</span>
                          <span style={{ fontWeight: 600, color: "#16a34a" }}>{sym}{amountPaid.toFixed(2)}</span>
                        </div>
                        <div
                          className="flex justify-between"
                          style={{
                            padding: "8px 0 0 0",
                            borderTop: "1px dashed #e5e7eb",
                            marginTop: 2,
                            fontSize: 15,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Balance Due</span>
                          <span style={{ fontWeight: 800, color: balanceDue > 0 ? "#ef4444" : "#16a34a" }}>
                            {sym}{balanceDue.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div style={{ marginTop: 32, padding: "12px 16px", background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#666" }}>
                    <p style={{ fontWeight: 600, marginBottom: 4, color: "#333" }}>Notes</p>
                    <p>{notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3">
            <Button onClick={downloadPDF} className="flex-1 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button onClick={() => downloadImage("png")} variant="outline" className="flex-1">
              <Image className="w-4 h-4 mr-2" /> PNG
            </Button>
            <Button onClick={() => downloadImage("jpeg")} variant="outline" className="flex-1">
              <Image className="w-4 h-4 mr-2" /> JPG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
