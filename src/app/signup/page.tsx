'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  console.log(router);
  
  // Handle signup
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault(); // Prevent default form submission behavior
    setErrorMessage(''); // Reset previous errors before submission
    setLoading(true); // Start loading state

    // Basic validation
    if (!username || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store username and email in Firestore
      console.log("Storing data in Firestore:", { username, email });
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
      });

      // Redirect to login page after successful signup
      router.replace('/login');
    } catch (error: any) {
      console.error("Error writing to Firestore: ", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already in use. Please try a different one.');
      } else {
        setErrorMessage('An error occurred while creating your account. Please try again.');
      }
    } finally {
      setLoading(false); // End loading state
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup} className="flex flex-col w-80 space-y-4">
        {/* Username input field */}
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          className="p-2 border rounded" 
        />
        {/* Email input field */}
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          className="p-2 border rounded" 
        />
        {/* Display error message for email */}
        {errorMessage && email && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
        {/* Password input field */}
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          className="p-2 border rounded" 
        />
        <button 
          type="submit" 
          className={`bg-green-500 text-white py-2 rounded ${loading ? 'cursor-not-allowed opacity-50' : ''}`} 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p>Already have an account ? <Link href="/login" className="text-blue-600 underline">Login</Link></p>
    </main>
  );
}
