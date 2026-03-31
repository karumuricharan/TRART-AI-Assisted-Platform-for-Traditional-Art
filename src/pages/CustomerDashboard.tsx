import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Package, Plus } from 'lucide-react';

export default function CustomerDashboard() {
  const { profile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold mb-2">
          Welcome, {profile?.full_name || 'Artist Seeker'}
        </h1>
        <p className="text-muted-foreground mb-8">What would you like to create today?</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
          <Link to="/generate-art">
            <Card className="hover:shadow-warm transition-shadow cursor-pointer border-2 hover:border-accent/50 h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg gradient-gold flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="font-heading">Generate Art</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Describe your vision, choose an Indian art style, and let AI create preview concepts.
                </p>
                <Button className="mt-4 gap-2 gradient-maroon text-primary-foreground border-0" size="sm">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/orders">
            <Card className="hover:shadow-warm transition-shadow cursor-pointer border-2 hover:border-accent/50 h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-2">
                  <Package className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="font-heading">Track Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  View your art requests, track progress, and communicate with your artist.
                </p>
                <Button variant="outline" className="mt-4" size="sm">
                  View Orders
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
