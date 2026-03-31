import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Palette, User } from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Palette className="h-7 w-7 text-accent" />
          <span className="font-heading text-2xl font-bold text-foreground">
            TR<span className="text-accent">ART</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user && profile ? (
            <>
              <Link to={profile.role === 'customer' ? '/dashboard' : '/artist-dashboard'}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile.full_name}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gradient-maroon text-primary-foreground border-0">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
