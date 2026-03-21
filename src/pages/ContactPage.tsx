import React from 'react';
import { Mail, MapPin } from 'lucide-react';

function ContactPage() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-surface/80">
      <h1 className="text-5xl font-black font-headline uppercase mb-8 text-white border-l-8 border-primary pl-6">Contact Us</h1>
      
      <div className="space-y-6 font-medium leading-relaxed mb-12">
        <p>
          For any queries, support, or assistance, users can contact us through the following:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
        <div className="brute-card bg-surface p-8 border-l-8 border-primary">
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <Mail className="text-primary" /> Email Support
          </h3>
          <p className="font-bold text-lg">
            <a href="mailto:care.alpha.iitian@gmail.com" className="hover:text-primary transition-colors">care.alpha.iitian@gmail.com</a>
          </p>
          <p className="text-black/60 mt-4 text-sm font-bold">We aim to respond to all queries within a reasonable timeframe.</p>
        </div>

        <div className="brute-card bg-surface p-8 border-l-8 border-black">
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <MapPin className="text-black" /> Office Location
          </h3>
          <p className="font-bold text-lg">Delhi, India</p>
          <p className="text-black/60 mt-4 text-sm font-bold">Phone: Not available at this time</p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
