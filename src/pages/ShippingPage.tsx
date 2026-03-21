import React from 'react';

function ShippingPage() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-surface/80">
      <h1 className="text-5xl font-black font-headline uppercase mb-8 text-white border-l-8 border-primary pl-6">Shipping and Delivery Policy</h1>
      
      <div className="space-y-6 font-medium leading-relaxed">
        <p>
          Alpha IITian provides only digital products. There is no physical shipping involved.
        </p>

        <p>
          Upon successful payment, users are granted immediate access to the purchased course through their account on the platform.
        </p>

        <p>
          In case of any delay or technical issue in accessing the course, users may contact support for assistance.
        </p>
      </div>
    </div>
  );
}

export default ShippingPage;
