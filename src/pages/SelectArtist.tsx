import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Star, Send, User, Palette } from 'lucide-react';

// Mock artists (will come from DB later)
const MOCK_ARTISTS = [
  {
    id: '1', full_name: 'Rahul Vardharajan', experience_years: 10,
    specializations: ['Traditional Murals', 'Canvas Painting'],
    bio: 'Versatile traditional artist specializing in murals and canvas work with a modern touch.',
    rating: 4.8, total_reviews: 95, ai_price: 16000,
    email: 'n5357986cd@gmail.com',
  },
  {
    id: '2', full_name: 'Priya Sharma', experience_years: 12,
    specializations: ['Madhubani Painting', 'Warli Painting'],
    bio: 'Award-winning Madhubani artist from Bihar with works exhibited in national galleries.',
    rating: 4.9, total_reviews: 128, ai_price: 15000,
  },
  {
    id: '3', full_name: 'Rajesh Kumar', experience_years: 8,
    specializations: ['Tanjore Painting', 'Mysore Painting'],
    bio: 'Traditional Tanjore painter specializing in gold leaf work and religious themes.',
    rating: 4.7, total_reviews: 85, ai_price: 18000,
  },
  {
    id: '4', full_name: 'Anita Devi', experience_years: 15,
    specializations: ['Pattachitra', 'Kalamkari'],
    bio: 'Master artisan from Odisha preserving the ancient Pattachitra tradition.',
    rating: 4.8, total_reviews: 203, ai_price: 22000,
  },
  {
    id: '5', full_name: 'Vikram Singh', experience_years: 6,
    specializations: ['Gond Art', 'Bhil Art'],
    bio: 'Young tribal artist bringing contemporary flair to traditional Gond paintings.',
    rating: 4.6, total_reviews: 47, ai_price: 12000,
  },
];

export default function SelectArtist() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSendRequest = () => {
    if (!selectedId) {
      toast({ title: 'Please select an artist', variant: 'destructive' });
      return;
    }
    const artist = MOCK_ARTISTS.find((a) => a.id === selectedId);
    sessionStorage.setItem('selectedArtist', JSON.stringify(artist));
    toast({ title: 'Request sent!', description: `Your request has been sent to ${artist?.full_name}.` });
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

        <div className="space-y-4 mb-6">
          {MOCK_ARTISTS.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                onClick={() => setSelectedId(artist.id)}
                className={`cursor-pointer transition-all ${
                  selectedId === artist.id
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
                      <p className="text-sm text-muted-foreground mt-1">{artist.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {artist.specializations.map((s) => (
                          <span key={s} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm mt-2 font-medium text-accent">
                        AI Estimated Price: ₹{artist.ai_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={handleSendRequest}
          disabled={!selectedId}
          className="w-full gradient-maroon text-primary-foreground border-0 gap-2"
          size="lg"
        >
          <Send className="h-4 w-4" /> Send Request
        </Button>
      </motion.div>
    </div>
  );
}
