import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Star, Send, User, Palette, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ArtistOption {
  user_id: string;
  full_name: string;
  experience_years: number;
  specializations: string[];
  bio: string;
  rating: number;
  total_reviews: number;
}

export default function SelectArtist() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    // Fetch artist_profiles joined with profiles for full_name
    const { data: artistProfiles, error } = await supabase
      .from('artist_profiles')
      .select('user_id, experience_years, specializations, bio, rating, total_reviews');

    if (error) {
      console.error('Error fetching artists:', error);
      setLoading(false);
      return;
    }

    if (!artistProfiles || artistProfiles.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch profile names for each artist
    const userIds = artistProfiles.map((a) => a.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

    const merged: ArtistOption[] = artistProfiles.map((a) => ({
      user_id: a.user_id,
      full_name: profileMap.get(a.user_id) || 'Artist',
      experience_years: a.experience_years,
      specializations: a.specializations,
      bio: a.bio,
      rating: Number(a.rating),
      total_reviews: a.total_reviews,
    }));

    setArtists(merged);
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!selectedId || !user) {
      toast({ title: 'Please select an artist', variant: 'destructive' });
      return;
    }

    const artFormRaw = sessionStorage.getItem('artForm');
    const selectedPreview = sessionStorage.getItem('selectedPreview');
    const finalPrompt = sessionStorage.getItem('finalPrompt');

    if (!artFormRaw) {
      toast({ title: 'Art form data missing. Please start over.', variant: 'destructive' });
      navigate('/generate-art');
      return;
    }

    const artForm = JSON.parse(artFormRaw);
    setSending(true);

    const { error } = await supabase.from('art_requests').insert({
      customer_id: user.id,
      artist_id: selectedId,
      description: artForm.description,
      art_style: artForm.artStyle,
      art_type: artForm.artType,
      medium: artForm.medium,
      width: artForm.width,
      height: artForm.height,
      budget_min: artForm.budgetMin,
      budget_max: artForm.budgetMax,
      reference_images: [],
      ai_preview_images: selectedPreview ? [selectedPreview] : [],
      selected_preview: selectedPreview || null,
      final_prompt: finalPrompt || null,
      status: 'request_sent',
      delivery_address_line1: profile?.address_line1 || null,
      delivery_address_line2: profile?.address_line2 || null,
      delivery_city: profile?.city || null,
      delivery_state: profile?.state || null,
      delivery_pincode: profile?.pincode || null,
      delivery_phone: profile?.phone || null,
    } as any);

    setSending(false);

    if (error) {
      console.error('Error creating request:', error);
      toast({ title: 'Failed to send request', description: error.message, variant: 'destructive' });
      return;
    }

    const artist = artists.find((a) => a.user_id === selectedId);
    toast({ title: 'Request sent!', description: `Your request has been sent to ${artist?.full_name}.` });
    // Clean up session
    sessionStorage.removeItem('artForm');
    sessionStorage.removeItem('selectedPreview');
    sessionStorage.removeItem('finalPrompt');
    navigate('/orders');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center">
            <Palette className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Select an Artist</h1>
            <p className="text-sm text-muted-foreground">Choose a skilled artist for your project</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No artists available yet. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  onClick={() => setSelectedId(artist.user_id)}
                  className={`cursor-pointer transition-all ${
                    selectedId === artist.user_id
                      ? 'border-accent shadow-gold ring-2 ring-accent/30'
                      : 'hover:shadow-warm hover:border-accent/40'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-heading font-semibold text-lg">{artist.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{artist.experience_years} years experience</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 text-accent">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-semibold">{artist.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{artist.total_reviews} reviews</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{artist.bio || 'Traditional Indian artist'}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {artist.specializations.map((s) => (
                            <span key={s} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Button
          onClick={handleSendRequest}
          disabled={!selectedId || sending}
          className="w-full gradient-maroon text-primary-foreground border-0 gap-2"
          size="lg"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? 'Sending...' : 'Send Request'}
        </Button>
      </motion.div>
    </div>
  );
}
