export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to FitTrack</h1>
      <p className="mb-6">Track your fitness goals, daily progress, and health stats all in one place.</p>
      <div className="space-x-4">
        <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Login</a>
        <a href="/signup" className="bg-gray-700 text-white px-4 py-2 rounded">Sign Up</a>
      </div>
    </main>
  );
}