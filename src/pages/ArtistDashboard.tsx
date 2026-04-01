import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Inbox, Check, X, DollarSign, Package, Truck, MapPin, History, Eye, ZoomIn } from 'lucide-react';
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
  rejectedAt?: string;
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  deliveryTrackingId?: string;
  deliveryProvider?: string;
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
    previewImage: 'https://placehold.co/400x400/8B4513/FFF?text=Madhubani+Art',
    status: 'request_sent',
    aiSuggestedPrice: 15000,
    deliveryAddress: {
      line1: '42, MG Road, Near Temple',
      line2: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      phone: '9876543210',
    },
  },
  {
    id: '2',
    customerName: 'Sneha Reddy',
    artStyle: 'Warli Painting',
    description: 'Village scene with dancing figures and nature elements',
    size: '18" × 24"',
    medium: 'Wall',
    budget: '₹8,000 – ₹20,000',
    previewImage: 'https://placehold.co/400x400/800020/FFF?text=Warli+Art',
    status: 'request_sent',
    aiSuggestedPrice: 12000,
    deliveryAddress: {
      line1: '15, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      phone: '9123456789',
    },
  },
];

// Pre-populated order history (accepted + rejected)
const INITIAL_HISTORY: MockRequest[] = [
  {
    id: 'h1',
    customerName: 'Ravi Kumar',
    artStyle: 'Tanjore Painting',
    description: 'Lord Krishna with golden embellishments',
    size: '20" × 30"',
    medium: 'Canvas',
    budget: '₹10,000 – ₹30,000',
    previewImage: 'https://placehold.co/400x400/B8860B/FFF?text=Tanjore+Art',
    status: 'delivered',
    aiSuggestedPrice: 20000,
    artistPrice: 22000,
    deliveryProvider: 'BlueDart',
    deliveryTrackingId: 'BD12345678',
    deliveryAddress: { line1: '10, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', phone: '9988776655' },
  },
  {
    id: 'h2',
    customerName: 'Meera Joshi',
    artStyle: 'Gond Art',
    description: 'Tree of life with birds and animals in Gond tribal style',
    size: '16" × 20"',
    medium: 'Canvas',
    budget: '₹4,000 – ₹12,000',
    previewImage: 'https://placehold.co/400x400/2E8B57/FFF?text=Gond+Art',
    status: 'completed',
    aiSuggestedPrice: 8000,
    artistPrice: 9500,
    deliveryAddress: { line1: '22, Laxmi Nagar', city: 'Delhi', state: 'Delhi', pincode: '110092', phone: '9012345678' },
  },
  {
    id: 'h3',
    customerName: 'Pooja Singh',
    artStyle: 'Pichwai Art',
    description: 'Shrinathji with cow and lotus motif',
    size: '24" × 36"',
    medium: 'Fabric',
    budget: '₹15,000 – ₹40,000',
    previewImage: 'https://placehold.co/400x400/4B0082/FFF?text=Pichwai+Art',
    status: 'request_sent',
    aiSuggestedPrice: 30000,
    rejectedAt: new Date().toLocaleDateString(),
  },
];

type Tab = 'incoming' | 'history';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  request_sent: { label: 'Declined', className: 'bg-destructive/10 text-destructive' },
  artist_accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700' },
  price_negotiation: { label: 'Negotiating', className: 'bg-accent/10 text-accent' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  delivered: { label: 'Delivered', className: 'bg-green-200 text-green-800' },
};

export default function ArtistDashboard() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [orderHistory, setOrderHistory] = useState(INITIAL_HISTORY);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [deliveryInputs, setDeliveryInputs] = useState<Record<string, { provider: string; trackingId: string }>>({});
  const [showDeliveryForm, setShowDeliveryForm] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Tab>('incoming');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleAccept = (id: string) => {
    setRequests((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status: 'artist_accepted' as OrderStatus } : r));
      const accepted = updated.find((r) => r.id === id);
      if (accepted) setOrderHistory((h) => [accepted, ...h]);
      return updated;
    });
    toast({ title: 'Request accepted!' });
  };

  const handleReject = (id: string) => {
    const rejected = requests.find((r) => r.id === id);
    if (rejected) {
      setOrderHistory((h) => [{ ...rejected, rejectedAt: new Date().toLocaleDateString() }, ...h]);
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Request declined' });
  };

  const handleSubmitPrice = (id: string) => {
    const price = Number(priceInputs[id]);
    if (!price || price <= 0) {
      toast({ title: 'Enter a valid price', variant: 'destructive' });
      return;
    }
    const update = (r: MockRequest) =>
      r.id === id ? { ...r, artistPrice: price, status: 'price_negotiation' as OrderStatus } : r;
    setRequests((prev) => prev.map(update));
    setOrderHistory((prev) => prev.map(update));
    toast({ title: 'Price submitted for negotiation' });
  };

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    const update = (r: MockRequest) => (r.id === id ? { ...r, status } : r);
    setRequests((prev) => prev.map(update));
    setOrderHistory((prev) => prev.map(update));
    toast({ title: `Status updated to ${status.replace('_', ' ')}` });
  };

  const handleBookDelivery = (id: string) => {
    const input = deliveryInputs[id];
    if (!input?.provider?.trim() || !input?.trackingId?.trim()) {
      toast({ title: 'Please enter delivery provider and tracking ID', variant: 'destructive' });
      return;
    }
    const update = (r: MockRequest) =>
      r.id === id
        ? { ...r, deliveryProvider: input.provider, deliveryTrackingId: input.trackingId, status: 'delivered' as OrderStatus }
        : r;
    setRequests((prev) => prev.map(update));
    setOrderHistory((prev) => prev.map(update));
    setShowDeliveryForm((prev) => ({ ...prev, [id]: false }));
    toast({ title: 'Delivery booked successfully! 📦' });
  };

  const renderRequestCard = (req: MockRequest, isHistory = false) => {
    // In history, rejected items have rejectedAt set and status is still request_sent
    const isRejected = isHistory && req.rejectedAt && req.status === 'request_sent';
    const badge = isRejected
      ? STATUS_BADGE['request_sent']
      : STATUS_BADGE[req.status] || { label: req.status, className: 'bg-muted text-muted-foreground' };

    return (
      <Card key={req.id} className="shadow-warm">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className="relative group shrink-0">
              <img
                src={req.previewImage}
                alt="Preview"
                className="h-24 w-24 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                onClick={() => setPreviewImage(req.previewImage)}
              />
              <div
                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage(req.previewImage)}
              >
                <ZoomIn className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading font-semibold">{req.artStyle}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                  {isRejected ? 'Declined' : badge.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{req.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                <span>Customer: <span className="text-foreground font-medium">{req.customerName}</span></span>
                <span>Size: {req.size}</span>
                <span>Medium: {req.medium}</span>
                <span>Budget: {req.budget}</span>
              </div>
              <p className="text-sm mt-1 font-medium text-accent">
                AI Suggested: ₹{req.aiSuggestedPrice.toLocaleString()}
                {req.artistPrice && <span className="ml-3 text-foreground">Your Price: ₹{req.artistPrice.toLocaleString()}</span>}
              </p>
              {isRejected && req.rejectedAt && (
                <p className="text-xs text-destructive mt-1">Declined on {req.rejectedAt}</p>
              )}
            </div>
          </div>

          {/* Preview button for history items */}
          {isHistory && !isRejected && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setPreviewImage(req.previewImage)}
              >
                <Eye className="h-3.5 w-3.5" /> Preview Art
              </Button>
            </div>
          )}

          {/* Customer delivery address - visible after accepting */}
          {req.status !== 'request_sent' && req.deliveryAddress && (
            <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-semibold text-foreground">Delivery Address</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {req.deliveryAddress.line1}
                {req.deliveryAddress.line2 && `, ${req.deliveryAddress.line2}`}
                <br />
                {req.deliveryAddress.city}, {req.deliveryAddress.state} – {req.deliveryAddress.pincode}
                <br />
                Phone: {req.deliveryAddress.phone}
              </p>
            </div>
          )}

          {/* Delivery info for delivered history items */}
          {isHistory && req.status === 'delivered' && req.deliveryProvider && (
            <div className="mt-3 flex items-center gap-2 text-green-700 text-sm">
              <Truck className="h-4 w-4" />
              <span>Shipped via {req.deliveryProvider} — Tracking: <span className="font-mono">{req.deliveryTrackingId}</span></span>
            </div>
          )}

          {/* Actions only for incoming tab */}
          {!isHistory && (
            <>
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
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-green-600 font-medium mb-3">✓ Artwork completed — ready for delivery</p>
                  {!showDeliveryForm[req.id] ? (
                    <Button
                      onClick={() => setShowDeliveryForm((prev) => ({ ...prev, [req.id]: true }))}
                      size="sm"
                      className="gap-1 gradient-maroon text-primary-foreground border-0"
                    >
                      <Truck className="h-3.5 w-3.5" /> Book Delivery
                    </Button>
                  ) : (
                    <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
                      <p className="text-sm font-medium">Book Delivery & Ship</p>
                      <div>
                        <Label className="text-xs">Delivery Provider *</Label>
                        <Input
                          placeholder="e.g. Delhivery, India Post, BlueDart"
                          value={deliveryInputs[req.id]?.provider || ''}
                          onChange={(e) =>
                            setDeliveryInputs((prev) => ({
                              ...prev,
                              [req.id]: { ...prev[req.id], provider: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Tracking ID *</Label>
                        <Input
                          placeholder="Enter tracking number"
                          value={deliveryInputs[req.id]?.trackingId || ''}
                          onChange={(e) =>
                            setDeliveryInputs((prev) => ({
                              ...prev,
                              [req.id]: { ...prev[req.id], trackingId: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleBookDelivery(req.id)} size="sm" className="gap-1">
                          <Truck className="h-3.5 w-3.5" /> Confirm & Ship
                        </Button>
                        <Button
                          onClick={() => setShowDeliveryForm((prev) => ({ ...prev, [req.id]: false }))}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {req.status === 'delivered' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                    <Truck className="h-4 w-4" />
                    Shipped via {req.deliveryProvider}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tracking ID: <span className="font-mono text-foreground">{req.deliveryTrackingId}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-bold mb-2">Artist Dashboard</h1>
        <p className="text-muted-foreground mb-6">Welcome, {profile?.full_name || 'Artist'}</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'incoming' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox className="h-4 w-4" /> Incoming ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-4 w-4" /> Order History ({orderHistory.length})
          </button>
        </div>

        {/* Incoming Tab */}
        {activeTab === 'incoming' && (
          <>
            {requests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No incoming requests at the moment.</p>
              </Card>
            ) : (
              <div className="space-y-4">{requests.map((req) => renderRequestCard(req, false))}</div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {orderHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No order history yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">{orderHistory.map((req) => renderRequestCard(req, true))}</div>
            )}
          </>
        )}
      </motion.div>

      {/* Full-screen image preview dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2 bg-background/95 backdrop-blur">
          <DialogTitle className="sr-only">Art Preview</DialogTitle>
          {previewImage && (
            <img
              src={previewImage}
              alt="Art Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
