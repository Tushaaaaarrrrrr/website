import React from 'react';

function RefundPage() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-surface/80">
      <h1 className="text-5xl font-black font-headline uppercase mb-8 text-white border-l-8 border-primary pl-6">Refund and Cancellation Policy</h1>
      
      <div className="space-y-6 font-medium leading-relaxed">
        <p>
          All products offered on our platform are digital in nature.
        </p>

        <p>
          Once a course has been purchased, no refunds will be provided under any circumstances. This is due to the immediate access granted to digital content upon successful payment.
        </p>

        <p>
          Users are advised to review course details carefully before making a purchase decision.
        </p>

        <p>
          No cancellations are applicable once the purchase is completed.
        </p>
      </div>
    </div>
  );
}

export default RefundPage;
