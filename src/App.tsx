import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import GrungeOverlay from './components/GrungeOverlay';
import BruteButton from './components/BruteButton';
import LandingPage from './pages/LandingPage';
import CoursePage from './pages/CoursePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import ShippingPage from './pages/ShippingPage';
import ContactPage from './pages/ContactPage';
import BuyPage from './pages/BuyPage';
import ProfileSetup from './pages/ProfileSetup';
import { AuthProvider, useAuth } from './context/AuthContext';
import ManagerRoute from './components/ManagerRoute';
import ManagerLayout from './pages/manager/ManagerLayout';
import Dashboard from './pages/manager/Dashboard';
import Users from './pages/manager/Users';
import Courses from './pages/manager/Courses';
import ActivityLogs from './pages/manager/ActivityLogs';
import Support from './pages/manager/Support';
import SupportWidget from './components/SupportWidget';
import SupportHistory from './pages/SupportHistory';
import AllCoursesPage from './pages/AllCoursesPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import Orders from './pages/manager/Orders';
import { CartProvider, useCart } from './context/CartContext';

function GuardedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function HomeRoute() {
  const { loading, isManager } = useAuth();

  if (loading) return null;

  return isManager ? <Navigate to="/manager" replace /> : <LandingPage />;
}

function UserMenu() {
  const { user, profile, signOut, isManager, isProfileComplete } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end hidden sm:flex">
        <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Signed In As</span>
        <span className="text-sm font-black uppercase tracking-tighter">
          {profile?.name?.split(' ')[0] || 'Member'}
        </span>
      </div>
      {!isManager && (
        <button
          onClick={() => navigate('/checkout')}
          className="text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-2 border-2 border-black hover:bg-primary hover:border-primary transition-all hidden sm:block"
        >
          Cart {cartCount > 0 ? `(${cartCount})` : ''}
        </button>
      )}
      {!isManager && (
        <button
          onClick={() => navigate('/orders')}
          className="text-xs font-black uppercase tracking-widest bg-white text-black px-3 py-2 border-2 border-black hover:bg-primary hover:text-white transition-all hidden sm:block"
        >
          Orders
        </button>
      )}
      {!isProfileComplete && (
        <button
          onClick={() => navigate('/setup-profile')}
          className="text-xs font-black uppercase tracking-widest bg-white text-black px-3 py-2 border-2 border-primary hover:bg-primary hover:text-white transition-all hidden sm:block"
        >
          Complete Profile
        </button>
      )}
      {isManager && (
        <button 
          onClick={() => navigate('/manager')}
          className="text-xs font-black uppercase tracking-widest bg-primary text-black px-3 py-2 border-2 border-primary hover:bg-white hover:text-black transition-all shadow-[2px_2px_0px_0px_white] hidden sm:block"
        >
          Manager
        </button>
      )}
      <button 
        onClick={signOut}
        className="text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-2 border-2 border-primary hover:bg-primary transition-all shadow-[2px_2px_0px_0px_white]"
      >
        Sign Out
      </button>
    </div>
  );
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const isProfileSetup = location.pathname === '/setup-profile';
  const isLoginPage = location.pathname === '/login';
  const showChrome = !isProfileSetup && !isLoginPage;

  return (
    <div className="min-h-screen bg-black selection:bg-primary selection:text-white flex flex-col">
      <GrungeOverlay />
      <SupportWidget />

      {showChrome && (
        <nav className="fixed top-0 w-full z-50 border-b-4 border-black bg-surface text-black px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary flex items-center justify-center font-black text-white border-2 border-black">
                A|I
              </div>
              <span className="text-2xl font-black font-headline uppercase tracking-tighter">
                Alpha <span className="text-primary italic">IITIAN</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8 font-bold uppercase tracking-widest text-sm">
              <a href="/#about" className="hover:text-primary transition-colors">About</a>
              <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
              <a href="/#results" className="hover:text-primary transition-colors">Results</a>
              <UserMenu />
            </div>

            <button 
              className="md:hidden p-2 brute-card bg-surface"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      )}

      <main className={`flex-grow ${showChrome ? 'pt-20' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<GuardedRoute><HomeRoute /></GuardedRoute>} />
          <Route path="/courses" element={<GuardedRoute><AllCoursesPage /></GuardedRoute>} />
          <Route path="/course/:id" element={<GuardedRoute><CoursePage /></GuardedRoute>} />
          <Route path="/checkout" element={<GuardedRoute><BuyPage /></GuardedRoute>} />
          <Route path="/buy" element={<GuardedRoute><BuyPage /></GuardedRoute>} />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          <Route path="/orders" element={<GuardedRoute><OrdersPage /></GuardedRoute>} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<GuardedRoute><SupportHistory /></GuardedRoute>} />
          
          <Route path="/manager" element={<ManagerRoute />}>
            <Route element={<ManagerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="courses" element={<Courses />} />
              <Route path="orders" element={<Orders />} />
              <Route path="activity" element={<ActivityLogs />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Route>
        </Routes>
      </main>

      {showChrome && (
        <footer className="bg-surface text-black border-t-8 border-black py-20 px-6 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="flex flex-col items-center md:items-start md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl">A|I</div>
                 <span className="text-3xl font-black font-headline uppercase">Alpha IITIAN</span>
              </div>
              <p className="text-black/50 font-bold text-sm max-w-xs text-center md:text-left mb-6">
                &copy; 2027 ALPHA IITIAN. <br/>
                DATA SCIENCE PROGRAM. <br/>
                ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-4">
                <BruteButton variant="black" className="px-4 py-2">
                  <span className="text-xl">𝕏</span>
                </BruteButton>
                <BruteButton variant="black" className="px-4 py-2">
                  <span className="text-xl">IG</span>
                </BruteButton>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 font-black uppercase tracking-widest text-sm">
              <h4 className="text-black/50 mb-2">Platform</h4>
              <a href="/#courses" className="hover:text-primary">Courses</a>
              <a href="/#about" className="hover:text-primary">About Us</a>
            </div>

            <div className="flex flex-col gap-4 font-black uppercase tracking-widest text-sm">
              <h4 className="text-black/50 mb-2">Legal & Compliance</h4>
              <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary">Terms & Conditions</Link>
              <Link to="/refund" className="hover:text-primary">Refund Policy</Link>
              <Link to="/shipping" className="hover:text-primary">Shipping & Delivery</Link>
              <Link to="/contact" className="hover:text-primary">Contact Us</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
