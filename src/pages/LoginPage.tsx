import { Navigate } from 'react-router-dom';
import BruteButton from '../components/BruteButton';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, isManager } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black uppercase tracking-widest">
        Authenticating...
      </div>
    );
  }

  if (user) {
    return <Navigate to={isManager ? '/manager' : '/'} replace />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="brute-card bg-surface p-10 md:p-16 max-w-xl w-full border-4 border-black relative text-center">
        <div className="absolute -top-8 -left-8 w-20 h-20 bg-primary border-4 border-black flex items-center justify-center font-black text-white text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          A|I
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-headline font-black uppercase leading-none tracking-tighter mb-2">
            Welcome To
          </h1>
          <h2 className="text-5xl md:text-7xl font-headline font-black uppercase leading-none tracking-tighter text-primary italic">
            Alpha IITIAN
          </h2>
        </div>

        <p className="text-[10px] md:text-[12px] font-bold text-black/60 mb-10 uppercase tracking-[0.2em] whitespace-nowrap">
          Sign in with Google to continue
        </p>

        <BruteButton variant="primary" className="w-full text-2xl py-6" onClick={signInWithGoogle}>
          Continue with Google
        </BruteButton>
      </div>
    </div>
  );
}
