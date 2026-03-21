import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black selection:bg-primary selection:text-white flex flex-col">
        <GrungeOverlay />
        
        {/* Navigation */}
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
              <a href="/#courses" className="hover:text-primary transition-colors">Courses</a>
              <a href="/#results" className="hover:text-primary transition-colors">Results</a>
              <a href="/#courses">
                <BruteButton variant="black" className="px-6 py-2 text-sm">Join Now</BruteButton>
              </a>
            </div>

            <button 
              className="md:hidden p-2 brute-card bg-surface"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        {/* Main Routing Content */}
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/course/:id" element={<CoursePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/refund" element={<RefundPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        {/* Footer */}
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
      </div>
    </BrowserRouter>
  );
}

export default App;
