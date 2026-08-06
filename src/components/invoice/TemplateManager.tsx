import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, FolderOpen, Trash2, Pencil, Check, X } from "lucide-react";
import { InvoiceTemplate } from "@/hooks/use-invoice-templates";

interface TemplateManagerProps {
  templates: InvoiceTemplate[];
  onSave: (name: string) => void;
  onLoad: (template: InvoiceTemplate) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export function TemplateManager({ templates, onSave, onLoad, onDelete, onRename }: TemplateManagerProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleSave = () => {
    if (!templateName.trim()) return;
    onSave(templateName.trim());
    setTemplateName("");
    setSaveOpen(false);
  };

  const startRename = (t: InvoiceTemplate) => {
    setEditingId(t.id);
    setEditingName(t.name);
  };

  const confirmRename = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex gap-2">
      {/* Save Dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-1" /> Save Template
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Template name…"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <Button onClick={handleSave} disabled={!templateName.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadOpen} onOpenChange={(open) => { setLoadOpen(open); if (!open) setEditingId(null); }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-1" /> Load Template
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
          </DialogHeader>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No saved templates yet.</p>
          ) : (
            <ScrollArea className="max-h-72">
              <div className="space-y-2">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    {editingId === t.id ? (
                      <div className="flex-1 flex items-center gap-2 mr-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                          autoFocus
                          className="h-8 text-sm"
                        />
                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-primary" onClick={confirmRename}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="flex-1 text-left"
                          onClick={() => { onLoad(t); setLoadOpen(false); }}
                        >
                          <p className="font-medium text-sm text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(t.savedAt).toLocaleDateString()} · {t.data.items.length} item(s)
                          </p>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => startRename(t)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={() => onDelete(t.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
