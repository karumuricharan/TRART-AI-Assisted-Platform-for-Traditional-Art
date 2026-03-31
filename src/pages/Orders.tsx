import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Clock, CheckCircle, Truck, DollarSign, UserCheck } from 'lucide-react';
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

// Mock order for demo
const MOCK_ORDER = {
  id: '1',
  artStyle: 'Madhubani Painting',
  description: 'Peacock near lotus pond with vibrant colors',
  status: 'request_sent' as OrderStatus,
  artist: 'Priya Sharma',
  createdAt: new Date().toLocaleDateString(),
};

function ProgressBar({ status }: { status: OrderStatus }) {
  const currentIndex = ALL_STATUSES.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-4">
      {ALL_STATUSES.map((s, i) => (
        <div key={s} className="flex-1 flex items-center">
          <div
            className={`h-2 w-full rounded-full transition-colors ${
              i <= currentIndex ? 'gradient-gold' : 'bg-muted'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-bold mb-6">Your Orders</h1>

        <Card className="shadow-warm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading font-semibold text-lg">{MOCK_ORDER.artStyle}</h3>
                <p className="text-sm text-muted-foreground">{MOCK_ORDER.description}</p>
                <p className="text-sm text-muted-foreground mt-1">Artist: <span className="font-medium text-foreground">{MOCK_ORDER.artist}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Created: {MOCK_ORDER.createdAt}</p>
              </div>
              <div className={`flex items-center gap-1.5 ${STATUS_CONFIG[MOCK_ORDER.status].color}`}>
                {(() => { const Icon = STATUS_CONFIG[MOCK_ORDER.status].icon; return <Icon className="h-4 w-4" />; })()}
                <span className="text-sm font-medium">{STATUS_CONFIG[MOCK_ORDER.status].label}</span>
              </div>
            </div>
            <ProgressBar status={MOCK_ORDER.status} />
            <div className="flex justify-between mt-2">
              {ALL_STATUSES.map((s) => (
                <span key={s} className="text-[10px] text-muted-foreground text-center flex-1">
                  {STATUS_CONFIG[s].label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty state hint */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Orders will appear here once you send art requests to artists.
        </p>
      </motion.div>
    </div>
  );
}
