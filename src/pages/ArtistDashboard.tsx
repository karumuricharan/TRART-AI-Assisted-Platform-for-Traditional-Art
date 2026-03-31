import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Inbox, Check, X, DollarSign, Package } from 'lucide-react';
import type { OrderStatus } from '@/types';

interface MockRequest {
  id: string;
  customerName: string;
  artStyle: string;
  description: string;
  size: string;
  medium: string;
  budget: string;
  previewImage: string;
  status: OrderStatus;
  aiSuggestedPrice: number;
  artistPrice?: number;
}

const INITIAL_REQUESTS: MockRequest[] = [
  {
    id: '1',
    customerName: 'Amit Patel',
    artStyle: 'Madhubani Painting',
    description: 'Peacock near lotus pond with vibrant colors in traditional style',
    size: '24" × 36"',
    medium: 'Canvas',
    budget: '₹5,000 – ₹25,000',
    previewImage: 'https://placehold.co/200x200/8B4513/FFF?text=Madhubani',
    status: 'request_sent',
    aiSuggestedPrice: 15000,
  },
  {
    id: '2',
    customerName: 'Sneha Reddy',
    artStyle: 'Warli Painting',
    description: 'Village scene with dancing figures and nature elements',
    size: '18" × 24"',
    medium: 'Wall',
    budget: '₹8,000 – ₹20,000',
    previewImage: 'https://placehold.co/200x200/800020/FFF?text=Warli',
    status: 'request_sent',
    aiSuggestedPrice: 12000,
  },
];

export default function ArtistDashboard() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

  const handleAccept = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'artist_accepted' as OrderStatus } : r))
    );
    toast({ title: 'Request accepted!' });
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Request declined' });
  };

  const handleSubmitPrice = (id: string) => {
    const price = Number(priceInputs[id]);
    if (!price || price <= 0) {
      toast({ title: 'Enter a valid price', variant: 'destructive' });
      return;
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, artistPrice: price, status: 'price_negotiation' as OrderStatus } : r
      )
    );
    toast({ title: 'Price submitted for negotiation' });
  };

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    toast({ title: `Status updated to ${status.replace('_', ' ')}` });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-bold mb-2">
          Artist Dashboard
        </h1>
        <p className="text-muted-foreground mb-6">Welcome, {profile?.full_name || 'Artist'}</p>

        <div className="flex items-center gap-2 mb-4">
          <Inbox className="h-5 w-5 text-accent" />
          <h2 className="font-heading font-semibold text-lg">Incoming Requests</h2>
        </div>

        {requests.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No incoming requests at the moment.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="shadow-warm">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <img
                      src={req.previewImage}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold">{req.artStyle}</h3>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                        <span>Customer: <span className="text-foreground font-medium">{req.customerName}</span></span>
                        <span>Size: {req.size}</span>
                        <span>Medium: {req.medium}</span>
                        <span>Budget: {req.budget}</span>
                      </div>
                      <p className="text-sm mt-1 font-medium text-accent">
                        AI Suggested Price: ₹{req.aiSuggestedPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions based on status */}
                  {req.status === 'request_sent' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                      <Button onClick={() => handleAccept(req.id)} className="gradient-maroon text-primary-foreground border-0 gap-1" size="sm">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button onClick={() => handleReject(req.id)} variant="outline" size="sm" className="gap-1">
                        <X className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}

                  {req.status === 'artist_accepted' && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Label className="text-sm">Set Your Price (₹)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="number"
                          placeholder="Enter price"
                          value={priceInputs[req.id] || ''}
                          onChange={(e) => setPriceInputs({ ...priceInputs, [req.id]: e.target.value })}
                          className="max-w-[180px]"
                        />
                        <Button onClick={() => handleSubmitPrice(req.id)} size="sm" className="gap-1">
                          <DollarSign className="h-3.5 w-3.5" /> Submit
                        </Button>
                      </div>
                    </div>
                  )}

                  {(req.status === 'price_negotiation' || req.status === 'in_progress') && (
                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      {req.status === 'price_negotiation' && (
                        <Button onClick={() => handleUpdateStatus(req.id, 'in_progress')} size="sm" className="gap-1">
                          <Package className="h-3.5 w-3.5" /> Start Work
                        </Button>
                      )}
                      {req.status === 'in_progress' && (
                        <Button onClick={() => handleUpdateStatus(req.id, 'completed')} size="sm" className="gradient-gold text-accent-foreground border-0 gap-1">
                          <Check className="h-3.5 w-3.5" /> Mark Completed
                        </Button>
                      )}
                    </div>
                  )}

                  {req.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-border text-sm text-green-600 font-medium">
                      ✓ Artwork completed — ready for delivery
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
