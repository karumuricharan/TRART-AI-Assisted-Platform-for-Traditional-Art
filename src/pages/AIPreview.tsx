import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Sparkles, Loader2 } from 'lucide-react';
import type { GenerateArtForm } from '@/types';

// Placeholder previews (will be replaced with real AI generation)
const generatePlaceholders = (prompt: string, style: string) => {
  const colors = ['8B4513', 'B8860B', '800020', 'DAA520', 'A0522D', 'CD853F'];
  return Array.from({ length: 4 }, (_, i) => {
    const c = colors[(i + prompt.length) % colors.length];
    return `https://placehold.co/512x512/${c}/FFF?text=${encodeURIComponent(style.split(' ')[0])}+${i + 1}`;
  });
};

export default function AIPreview() {
  const navigate = useNavigate();
  const [form, setForm] = useState<GenerateArtForm | null>(null);
  const [prompt, setPrompt] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('artForm');
    if (!stored) {
      navigate('/generate-art');
      return;
    }
    const parsed = JSON.parse(stored) as GenerateArtForm;
    setForm(parsed);
    setPrompt(parsed.description);
    generatePreviews(parsed.description, parsed.artStyle);
  }, []);

  const generatePreviews = async (desc: string, style: string) => {
    setLoading(true);
    setSelected(null);
    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 2000));
    setPreviews(generatePlaceholders(desc, style));
    setLoading(false);
  };

  const handleRegenerate = () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }
    generatePreviews(prompt, form?.artStyle || 'Traditional');
  };

  const handleConfirm = () => {
    if (selected === null) {
      toast({ title: 'Please select a design first', variant: 'destructive' });
      return;
    }
    sessionStorage.setItem('selectedPreview', previews[selected]);
    sessionStorage.setItem('finalPrompt', prompt);
    toast({ title: 'Design confirmed!' });
    navigate('/select-artist');
  };

  if (!form) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">AI Preview</h1>
            <p className="text-sm text-muted-foreground">
              {form.artStyle} • {form.artType} • {form.medium}
            </p>
          </div>
        </div>

        {/* Prompt refinement */}
        <Card className="mb-6 p-4">
          <Label className="mb-2 block font-semibold">Refine Your Idea</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Modify your prompt to refine the results..."
            rows={3}
          />
          <Button
            onClick={handleRegenerate}
            disabled={loading}
            variant="outline"
            className="mt-3 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Preview
          </Button>
        </Card>

        {/* Previews grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
            <p className="text-muted-foreground font-medium">Generating AI previews...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {previews.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelected(i)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-3 transition-all ${
                    selected === i
                      ? 'border-accent shadow-gold ring-2 ring-accent/30'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  {selected === i && (
                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full gradient-gold flex items-center justify-center">
                      <Check className="h-5 w-5 text-accent-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleConfirm}
              disabled={selected === null}
              className="w-full gradient-maroon text-primary-foreground border-0 gap-2"
              size="lg"
            >
              <Check className="h-4 w-4" /> Confirm Design & Select Artist
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
