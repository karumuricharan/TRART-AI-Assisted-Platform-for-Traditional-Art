import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Inbox, Check, X, DollarSign, Package, Truck, MapPin, History, Eye, ZoomIn, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OrderStatus } from '@/types';

interface ArtRequestRow {
  id: string;
  customer_id: string;
  customerName: string;
  art_style: string;
  description: string;
  width: number;
  height: number;
  medium: string;
  budget_min: number;
  budget_max: number;
  ai_preview_images: string[];
  selected_preview: string | null;
  status: OrderStatus;
  ai_suggested_price: number | null;
  artist_price: number | null;
  delivery_address_line1: string | null;
  delivery_address_line2: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_pincode: string | null;
  delivery_phone: string | null;
  delivery_provider: string | null;
  delivery_tracking_id: string | null;
  created_at: string;
}

type Tab = 'incoming' | 'history';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  request_sent: { label: 'New Request', className: 'bg-accent/10 text-accent' },
  declined: { label: 'Declined', className: 'bg-destructive/10 text-destructive' },
  artist_accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700' },
  price_negotiation: { label: 'Negotiating', className: 'bg-accent/10 text-accent' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  delivered: { label: 'Delivered', className: 'bg-green-200 text-green-800' },
};

export default function ArtistDashboard() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<ArtRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [deliveryInputs, setDeliveryInputs] = useState<Record<string, { provider: string; trackingId: string }>>({});
  const [showDeliveryForm, setShowDeliveryForm] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Tab>('incoming');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchRequests();

    // Real-time subscription for artist orders
    const channel = supabase
      .channel('artist-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'art_requests', filter: `artist_id=eq.${user.id}` },
        () => fetchRequests()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('art_requests')
      .select('*')
      .eq('artist_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // Fetch customer names
    const customerIds = [...new Set(data.map((d) => d.customer_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', customerIds);
    const nameMap = new Map<string, string>((profiles || []).map((p) => [p.id, p.full_name] as [string, string]));

    const mapped: ArtRequestRow[] = data.map((d: any) => ({
      id: d.id,
      customer_id: d.customer_id,
      customerName: nameMap.get(d.customer_id) || 'Customer',
      art_style: d.art_style,
      description: d.description,
      width: d.width,
      height: d.height,
      medium: d.medium,
      budget_min: Number(d.budget_min),
      budget_max: Number(d.budget_max),
      ai_preview_images: d.ai_preview_images || [],
      selected_preview: d.selected_preview,
      status: d.status as OrderStatus,
      ai_suggested_price: d.ai_suggested_price ? Number(d.ai_suggested_price) : null,
      artist_price: d.artist_price ? Number(d.artist_price) : null,
      delivery_address_line1: d.delivery_address_line1,
      delivery_address_line2: d.delivery_address_line2,
      delivery_city: d.delivery_city,
      delivery_state: d.delivery_state,
      delivery_pincode: d.delivery_pincode,
      delivery_phone: d.delivery_phone,
      delivery_provider: d.delivery_provider,
      delivery_tracking_id: d.delivery_tracking_id,
      created_at: d.created_at,
    }));

    setRequests(mapped);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string, extraFields: Record<string, any> = {}) => {
    const { error } = await supabase
      .from('art_requests')
      .update({ status, ...extraFields } as any)
      .eq('id', id);

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleAccept = async (id: string) => {
    if (await updateStatus(id, 'artist_accepted')) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'artist_accepted' as OrderStatus } : r)));
      toast({ title: 'Request accepted!' });
    }
  };

  const handleReject = async (id: string) => {
    if (await updateStatus(id, 'declined')) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'declined' as OrderStatus } : r)));
      toast({ title: 'Request declined' });
    }
  };

  const handleSubmitPrice = async (id: string) => {
    const price = Number(priceInputs[id]);
    if (!price || price <= 0) {
      toast({ title: 'Enter a valid price', variant: 'destructive' });
      return;
    }
    if (await updateStatus(id, 'price_negotiation', { artist_price: price })) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, artistPrice: price, status: 'price_negotiation' as OrderStatus, artist_price: price } : r)));
      toast({ title: 'Price submitted for negotiation' });
    }
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    if (await updateStatus(id, status)) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: `Status updated to ${status.replace(/_/g, ' ')}` });
    }
  };

  const handleBookDelivery = async (id: string) => {
    const input = deliveryInputs[id];
    if (!input?.provider?.trim() || !input?.trackingId?.trim()) {
      toast({ title: 'Please enter delivery provider and tracking ID', variant: 'destructive' });
      return;
    }
    if (await updateStatus(id, 'delivered', { delivery_provider: input.provider, delivery_tracking_id: input.trackingId, delivery_booked_at: new Date().toISOString() })) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'delivered' as OrderStatus, delivery_provider: input.provider, delivery_tracking_id: input.trackingId } : r)));
      setShowDeliveryForm((prev) => ({ ...prev, [id]: false }));
      toast({ title: 'Delivery booked successfully! 📦' });
    }
  };

  const incomingRequests = requests.filter((r) => r.status === 'request_sent');
  const historyRequests = requests.filter((r) => r.status !== 'request_sent');

  const renderRequestCard = (req: ArtRequestRow, isHistory = false) => {
    const isRejected = req.status === ('declined' as any);
    const badge = isRejected
      ? STATUS_BADGE['declined']
      : STATUS_BADGE[req.status] || { label: req.status, className: 'bg-muted text-muted-foreground' };
    const previewUrl = req.selected_preview || req.ai_preview_images?.[0];

    return (
      <Card key={req.id} className="shadow-warm">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {previewUrl && (
              <div className="relative group shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setPreviewImage(previewUrl)}
                />
                <div
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={() => setPreviewImage(previewUrl)}
                >
                  <ZoomIn className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading font-semibold">{req.art_style}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{req.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                <span>Customer: <span className="text-foreground font-medium">{req.customerName}</span></span>
                <span>Size: {req.width}" × {req.height}"</span>
                <span>Medium: {req.medium}</span>
                <span>Budget: ₹{req.budget_min.toLocaleString()} – ₹{req.budget_max.toLocaleString()}</span>
              </div>
              {req.ai_suggested_price && (
                <p className="text-sm mt-1 font-medium text-accent">
                  AI Suggested: ₹{req.ai_suggested_price.toLocaleString()}
                  {req.artist_price && <span className="ml-3 text-foreground">Your Price: ₹{req.artist_price.toLocaleString()}</span>}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(req.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Preview button for history items */}
          {isHistory && !isRejected && previewUrl && (
            <div className="mt-3">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewImage(previewUrl)}>
                <Eye className="h-3.5 w-3.5" /> Preview Art
              </Button>
            </div>
          )}

          {/* Customer delivery address */}
          {req.status !== 'request_sent' && req.status !== ('declined' as any) && req.delivery_address_line1 && (
            <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-semibold text-foreground">Delivery Address</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {req.delivery_address_line1}
                {req.delivery_address_line2 && `, ${req.delivery_address_line2}`}
                <br />
                {req.delivery_city}, {req.delivery_state} – {req.delivery_pincode}
                <br />
                Phone: {req.delivery_phone}
              </p>
            </div>
          )}

          {/* Delivery info for delivered */}
          {req.status === 'delivered' && req.delivery_provider && (
            <div className="mt-3 flex items-center gap-2 text-green-700 text-sm">
              <Truck className="h-4 w-4" />
              <span>Shipped via {req.delivery_provider} — Tracking: <span className="font-mono">{req.delivery_tracking_id}</span></span>
            </div>
          )}

          {/* Actions for incoming */}
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
            </>
          )}

          {/* Actions for accepted/in-progress */}
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
                        setDeliveryInputs((prev) => ({ ...prev, [req.id]: { ...prev[req.id], provider: e.target.value } }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tracking ID *</Label>
                    <Input
                      placeholder="Enter tracking number"
                      value={deliveryInputs[req.id]?.trackingId || ''}
                      onChange={(e) =>
                        setDeliveryInputs((prev) => ({ ...prev, [req.id]: { ...prev[req.id], trackingId: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleBookDelivery(req.id)} size="sm" className="gap-1">
                      <Truck className="h-3.5 w-3.5" /> Confirm & Ship
                    </Button>
                    <Button onClick={() => setShowDeliveryForm((prev) => ({ ...prev, [req.id]: false }))} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

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
            <Inbox className="h-4 w-4" /> Incoming ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-4 w-4" /> Order History ({historyRequests.length})
          </button>
        </div>

        {/* Incoming Tab */}
        {activeTab === 'incoming' && (
          <>
            {incomingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No incoming requests at the moment.</p>
              </Card>
            ) : (
              <div className="space-y-4">{incomingRequests.map((req) => renderRequestCard(req, false))}</div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {historyRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No order history yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">{historyRequests.map((req) => renderRequestCard(req, true))}</div>
            )}
          </>
        )}
      </motion.div>

      {/* Full-screen image preview dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2 bg-background/95 backdrop-blur">
          <DialogTitle className="sr-only">Art Preview</DialogTitle>
          {previewImage && (
            <img src={previewImage} alt="Art Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
