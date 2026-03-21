import React from 'react';

function TermsPage() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-surface/80">
      <h1 className="text-5xl font-black font-headline uppercase mb-8 text-white border-l-8 border-primary pl-6">Terms and Conditions</h1>
      
      <div className="space-y-6 font-medium leading-relaxed">
        <p>
          By accessing and using our platform, users agree to comply with all applicable terms outlined herein.
        </p>

        <p>
          All courses available on the platform are the intellectual property of Alpha IITian. Users are granted a limited, non-transferable, non-exclusive license to access the content for personal educational use only.
        </p>

        <p>
          Users are strictly prohibited from copying, distributing, recording, reselling, or sharing course content in any form. Any violation may result in immediate termination of access without refund and may lead to legal action.
        </p>

        <p>
          Users are responsible for maintaining the confidentiality of their account credentials. Any activity under a user’s account is their responsibility.
        </p>

        <p>
          We reserve the right to modify, update, or discontinue any part of the platform or services at any time without prior notice.
        </p>
      </div>
    </div>
  );
}

export default TermsPage;
