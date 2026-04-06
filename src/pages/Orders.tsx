import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Package, Clock, CheckCircle, Truck, DollarSign, UserCheck, Loader2, ZoomIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: any; color: string }> = {
  request_sent: { label: 'Request Sent', icon: Clock, color: 'text-accent' },
  artist_accepted: { label: 'Artist Accepted', icon: UserCheck, color: 'text-green-600' },
  price_negotiation: { label: 'Price Negotiation', icon: DollarSign, color: 'text-accent' },
  in_progress: { label: 'In Progress', icon: Package, color: 'text-blue-600' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-600' },
  delivered: { label: 'Delivered', icon: Truck, color: 'text-green-700' },
};

const ALL_STATUSES: OrderStatus[] = ['request_sent', 'artist_accepted', 'price_negotiation', 'in_progress', 'completed', 'delivered'];

function ProgressBar({ status }: { status: OrderStatus }) {
  const currentIndex = ALL_STATUSES.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-4">
      {ALL_STATUSES.map((s, i) => (
        <div key={s} className="flex-1">
          <div className={`h-2 w-full rounded-full transition-colors ${i <= currentIndex ? 'gradient-gold' : 'bg-muted'}`} />
        </div>
      ))}
    </div>
  );
}

interface OrderWithArtist {
  id: string;
  art_style: string;
  description: string;
  status: OrderStatus;
  artist_name: string;
  created_at: string;
  selected_preview: string | null;
  ai_preview_images: string[];
  budget_min: number;
  budget_max: number;
  artist_price: number | null;
  final_price: number | null;
  delivery_provider: string | null;
  delivery_tracking_id: string | null;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchOrders();

    // Real-time subscription for order updates
    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'art_requests', filter: `customer_id=eq.${user.id}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('art_requests')
      .select('*')
      .eq('customer_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // Fetch artist names
    const artistIds = [...new Set(data.filter((d) => d.artist_id).map((d) => d.artist_id!))];
    const { data: profiles } = artistIds.length > 0
      ? await supabase.from('profiles').select('id, full_name').in('id', artistIds)
      : { data: [] };
    const nameMap = new Map<string, string>((profiles || []).map((p) => [p.id, p.full_name] as [string, string]));

    const mapped: OrderWithArtist[] = data.map((d: any) => ({
      id: d.id,
      art_style: d.art_style,
      description: d.description,
      status: d.status as OrderStatus,
      artist_name: d.artist_id ? nameMap.get(d.artist_id) || 'Artist' : 'Unassigned',
      created_at: new Date(d.created_at).toLocaleDateString(),
      selected_preview: d.selected_preview,
      ai_preview_images: d.ai_preview_images,
      budget_min: Number(d.budget_min),
      budget_max: Number(d.budget_max),
      artist_price: d.artist_price ? Number(d.artist_price) : null,
      final_price: d.final_price ? Number(d.final_price) : null,
      delivery_provider: d.delivery_provider,
      delivery_tracking_id: d.delivery_tracking_id,
    }));

    setOrders(mapped);
    setLoading(false);
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
        <h1 className="text-2xl font-heading font-bold mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No orders yet. Generate art and select an artist to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const previewUrl = order.selected_preview || order.ai_preview_images?.[0];
              return (
                <Card key={order.id} className="shadow-warm">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {previewUrl && (
                        <div
                          className="relative group shrink-0 cursor-pointer"
                          onClick={() => setPreviewImage(previewUrl)}
                        >
                          <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded-lg object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ZoomIn className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-heading font-semibold text-lg">{order.art_style}</h3>
                            <p className="text-sm text-muted-foreground">{order.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Artist: <span className="font-medium text-foreground">{order.artist_name}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Created: {order.created_at}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 shrink-0 ${STATUS_CONFIG[order.status]?.color || 'text-muted-foreground'}`}>
                            {(() => { const Icon = STATUS_CONFIG[order.status]?.icon || Clock; return <Icon className="h-4 w-4" />; })()}
                            <span className="text-sm font-medium">{STATUS_CONFIG[order.status]?.label || order.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span>Budget: ₹{order.budget_min.toLocaleString()} – ₹{order.budget_max.toLocaleString()}</span>
                          {order.artist_price && <span>Artist Price: ₹{order.artist_price.toLocaleString()}</span>}
                          {order.final_price && <span className="text-accent font-medium">Final: ₹{order.final_price.toLocaleString()}</span>}
                        </div>
                        {order.delivery_provider && (
                          <div className="flex items-center gap-1.5 text-green-700 text-sm mt-2">
                            <Truck className="h-3.5 w-3.5" />
                            <span>{order.delivery_provider} — {order.delivery_tracking_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ProgressBar status={order.status} />
                    <div className="flex justify-between mt-2">
                      {ALL_STATUSES.map((s) => (
                        <span key={s} className="text-[10px] text-muted-foreground text-center flex-1">
                          {STATUS_CONFIG[s].label}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Full preview modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-2xl p-2">
          <DialogTitle className="sr-only">Art Preview</DialogTitle>
          {previewImage && (
            <img src={previewImage} alt="Full preview" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
