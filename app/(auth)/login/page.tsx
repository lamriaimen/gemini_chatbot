import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--background)] via-purple-950/10 to-[var(--background)]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">
                        Log in to continue your conversations
                    </p>
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 shadow-2xl animate-slide-up">
                    <AuthForm mode="login" />
                </div>
            </div>
        </div>
    );
}
