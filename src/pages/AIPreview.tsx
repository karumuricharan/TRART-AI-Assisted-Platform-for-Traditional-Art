import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { GenerateArtForm } from '@/types';

export default function AIPreview() {
  const navigate = useNavigate();
  const [form, setForm] = useState<GenerateArtForm | null>(null);
  const [prompt, setPrompt] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('artForm');
    if (!stored) {
      navigate('/generate-art');
      return;
    }
    const parsed = JSON.parse(stored) as GenerateArtForm;
    setForm(parsed);
    setPrompt(parsed.description);
    generateAllPreviews(parsed.description, parsed);
  }, []);

  const generateSinglePreview = async (
    desc: string,
    formData: GenerateArtForm,
    index: number
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-art-preview', {
        body: {
          description: desc,
          artStyle: formData.artStyle,
          artType: formData.artType,
          medium: formData.medium,
          imageIndex: index,
        },
      });

      if (error) {
        console.error(`Preview ${index} error:`, error);
        return null;
      }

      if (data?.error) {
        console.error(`Preview ${index} AI error:`, data.error);
        toast({ title: data.error, variant: 'destructive' });
        return null;
      }

      return data?.imageUrl || null;
    } catch (e) {
      console.error(`Preview ${index} exception:`, e);
      return null;
    }
  };

  const generateAllPreviews = async (desc: string, formData: GenerateArtForm) => {
    setLoading(true);
    setSelected(null);
    setPreviews([]);

    const results: string[] = [];

    // Generate 4 images sequentially to avoid rate limits
    for (let i = 0; i < 4; i++) {
      setLoadingIndex(i);
      const url = await generateSinglePreview(desc, formData, i);
      if (url) {
        results.push(url);
        setPreviews([...results]);
      }
      // Small delay between requests
      if (i < 3) await new Promise((r) => setTimeout(r, 1500));
    }

    setLoadingIndex(null);
    setLoading(false);

    if (results.length === 0) {
      toast({ title: 'Failed to generate previews. Please try again.', variant: 'destructive' });
    }
  };

  const handleRegenerate = () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }
    if (!form) return;
    generateAllPreviews(prompt, form);
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Array.from({ length: 4 }, (_, i) => {
            const url = previews[i];
            const isGenerating = loading && !url;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => url && setSelected(i)}
                className={`relative rounded-xl overflow-hidden border-3 transition-all aspect-square ${
                  url ? 'cursor-pointer' : ''
                } ${
                  selected === i
                    ? 'border-accent shadow-gold ring-2 ring-accent/30'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                {url ? (
                  <img
                    src={url}
                    alt={`AI Preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {loadingIndex === i ? 'Generating...' : 'Waiting...'}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Failed</p>
                    )}
                  </div>
                )}
                {selected === i && url && (
                  <div className="absolute top-3 right-3 h-8 w-8 rounded-full gradient-gold flex items-center justify-center">
                    <Check className="h-5 w-5 text-accent-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={selected === null || loading}
          className="w-full gradient-maroon text-primary-foreground border-0 gap-2"
          size="lg"
        >
          <Check className="h-4 w-4" /> Confirm Design & Select Artist
        </Button>
      </motion.div>
    </div>
  );
}
