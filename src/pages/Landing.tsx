import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Users, Truck } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Concepts',
    description: 'Generate stunning art previews using AI based on your vision and preferences.',
  },
  {
    icon: Users,
    title: 'Expert Indian Artists',
    description: 'Connect with skilled artists specializing in traditional Indian art forms.',
  },
  {
    icon: Palette,
    title: '19 Traditional Styles',
    description: 'From Tanjore to Madhubani, explore the rich diversity of Indian art.',
  },
  {
    icon: Truck,
    title: 'Track Your Artwork',
    description: 'Follow every step from concept to the finished physical masterpiece.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 gradient-maroon opacity-5" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
              <Palette className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">
                Traditional Indian Art, Reimagined
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Bring Your <span className="text-gradient-gold">Art Vision</span> to Life
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Use AI to visualize your concept, then let master Indian artists create
              the physical artwork — on wall, canvas, wood, or fabric.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="gradient-maroon text-primary-foreground border-0 text-lg px-8 shadow-warm">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-background rounded-xl p-6 shadow-warm border border-border"
              >
                <div className="h-12 w-12 rounded-lg gradient-gold flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Art Styles Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Explore Traditional Indian Art Styles
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Our platform supports 19 unique traditional art forms, each with centuries of cultural heritage.
          </p>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {['Tanjore', 'Kalamkari', 'Pattachitra', 'Warli', 'Madhubani', 'Pichwai', 'Gond', 'Kerala Murals', 'Kangra', 'Mysore'].map((style) => (
              <span
                key={style}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border"
              >
                {style}
              </span>
            ))}
            <span className="px-4 py-2 rounded-full gradient-gold text-accent-foreground text-sm font-medium">
              +9 more
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2026 TRART — Traditional Indian Art, Powered by AI & Human Mastery</p>
        </div>
      </footer>
    </div>
  );
}
