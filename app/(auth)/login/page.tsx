import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-slate-400">
            Log in to continue your conversations
          </p>
        </div>
        
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 shadow-xl">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
