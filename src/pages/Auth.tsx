import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';
import type { UserRole } from '@/types';

export default function Auth() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: 'Welcome back!' });
        navigate('/dashboard');
      } else {
        if (!fullName.trim()) {
          toast({ title: 'Please enter your full name', variant: 'destructive' });
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName, role);
        toast({ title: 'Account created!', description: 'Check your email to verify your account.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-warm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Palette className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="font-heading text-2xl">
            {isLogin ? 'Welcome Back' : 'Join TRART'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        role === 'customer'
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-accent/50'
                      }`}
                    >
                      <span className="font-semibold block">Customer</span>
                      <span className="text-xs">I want art created</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('artist')}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        role === 'artist'
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-accent/50'
                      }`}
                    >
                      <span className="font-semibold block">Artist</span>
                      <span className="text-xs">I create art</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full gradient-maroon text-primary-foreground border-0" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? (
              <>Don't have an account? <Link to="/register" className="text-accent font-medium hover:underline">Register</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Sign In</Link></>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
