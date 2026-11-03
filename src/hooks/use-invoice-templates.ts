import { useState, useEffect } from "react";

export interface InvoiceTemplate {
  id: string;
  name: string;
  savedAt: string;
  data: {
    userName: string;
    companyName: string;
    companyLogo: string | null;
    watermark: boolean;
    currency: string;
    clientName: string;
    clientEmail: string;
    notes: string;
    taxRate: number;
    discountType: "percent" | "fixed";
    discountValue: number;
    due?: number;
    amountPaid?: number;
    items: { id: string; description: string; quantity: number; price: number }[];
  };
}

const STORAGE_KEY = "invoice-templates";

function loadTemplates(): InvoiceTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistTemplates(templates: InvoiceTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(loadTemplates);

  useEffect(() => {
    persistTemplates(templates);
  }, [templates]);

  const saveTemplate = (name: string, data: InvoiceTemplate["data"]) => {
    const template: InvoiceTemplate = {
      id: crypto.randomUUID(),
      name,
      savedAt: new Date().toISOString(),
      data,
    };
    setTemplates((prev) => [template, ...prev]);
    return template;
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const renameTemplate = (id: string, newName: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
    );
  };

  return { templates, saveTemplate, deleteTemplate, renameTemplate };
}
