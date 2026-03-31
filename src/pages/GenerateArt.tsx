import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Sparkles, Upload, ArrowRight } from 'lucide-react';
import { ART_STYLES, ART_TYPES, MEDIUMS } from '@/types';
import type { GenerateArtForm } from '@/types';

export default function GenerateArt() {
  const navigate = useNavigate();
  const [form, setForm] = useState<GenerateArtForm>({
    description: '',
    artStyle: 'Madhubani Painting',
    artType: 'Canvas',
    medium: 'Canvas',
    width: 24,
    height: 36,
    budgetMin: 5000,
    budgetMax: 25000,
    referenceImages: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast({ title: 'Please enter a description', variant: 'destructive' });
      return;
    }
    // Store form in session and navigate to preview
    sessionStorage.setItem('artForm', JSON.stringify({
      ...form,
      referenceImages: [], // Can't serialize File objects
    }));
    navigate('/ai-preview');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Generate Art Concept</h1>
            <p className="text-sm text-muted-foreground">Describe your vision and let AI create previews</p>
          </div>
        </div>

        <Card className="shadow-warm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Description */}
              <div>
                <Label htmlFor="description">Describe Your Art Vision *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., A peacock standing near a lotus pond with vibrant colors in traditional Indian style..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Art Style */}
              <div>
                <Label>Indian Traditional Art Style *</Label>
                <Select value={form.artStyle} onValueChange={(v) => setForm({ ...form, artStyle: v as any })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ART_STYLES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Art Type & Medium */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Art Type *</Label>
                  <Select value={form.artType} onValueChange={(v) => setForm({ ...form, artType: v as any })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ART_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Medium *</Label>
                  <Select value={form.medium} onValueChange={(v) => setForm({ ...form, medium: v as any })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEDIUMS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width (inches)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={form.width}
                    onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
                    min={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                    min={1}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Min Budget (₹)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={form.budgetMin}
                    onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })}
                    min={0}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">Max Budget (₹)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={form.budgetMax}
                    onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })}
                    min={0}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Reference images */}
              <div>
                <Label>Reference Images (optional)</Label>
                <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground hover:border-accent/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Drag & drop images or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    style={{ position: 'relative' }}
                    onChange={(e) => {
                      if (e.target.files) {
                        setForm({ ...form, referenceImages: Array.from(e.target.files) });
                        toast({ title: `${e.target.files.length} image(s) selected` });
                      }
                    }}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gradient-maroon text-primary-foreground border-0 gap-2" size="lg">
                Generate AI Preview <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
