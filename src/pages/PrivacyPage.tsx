import React from 'react';

function PrivacyPage() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-surface/80">
      <h1 className="text-5xl font-black font-headline uppercase mb-8 text-white border-l-8 border-primary pl-6">Privacy Policy</h1>
      
      <div className="space-y-6 font-medium leading-relaxed">
        <p>
          Alpha IITian ("we", "our", or "us") operates this platform. We are committed to protecting the privacy of our users and ensuring that their personal information is handled in a secure and responsible manner.
        </p>

        <p>
          We collect personal information such as name, email address, and payment-related details when users register, purchase courses, or interact with our platform. This information is collected solely for the purpose of providing access to our courses, processing transactions, improving user experience, and communicating important updates.
        </p>

        <p>
          We do not sell, rent, or share user data with third parties for marketing purposes. Any third-party services used (such as payment gateways) are compliant with industry security standards.
        </p>

        <p>
          All user data is stored securely, and we implement appropriate technical and organizational measures to protect it from unauthorized access, misuse, or disclosure.
        </p>

        <p>
          By using our website, users consent to the collection and use of their information as outlined in this policy.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;
