'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    // Simple form validation
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.log('ERROR', error);
      if (error.code === 'auth/invalid-credential') {
        setErrorMessage('Password or Email incorrect. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    setInfoMessage('');
    if (!email) {
      setErrorMessage('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setInfoMessage('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setErrorMessage('Failed to send reset email. Please try again.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col w-80 space-y-4">
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          className="p-2 border rounded" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          className="p-2 border rounded" 
        />
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        {infoMessage && <p className="text-green-600 text-sm">{infoMessage}</p>}
        <button 
          type="submit" 
          className={`bg-blue-500 text-white py-2 rounded ${loading ? 'cursor-not-allowed opacity-50' : ''}`} 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        <p>Don't have an account yet? <Link href="/signup" className="text-blue-600 underline">Sign up</Link></p>
        <p className="mt-2">
          Forgot your password?{' '}
          <button onClick={handleResetPassword} className="text-blue-600 underline">
            Reset Password
          </button>
        </p>
      </div>
    </main>
  );
}
