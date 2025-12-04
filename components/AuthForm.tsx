'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
    mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;

                // Auto-login after signup
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                router.push('/chat');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                router.push('/chat');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    placeholder="••••••••"
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-pulse-subtle">●</span>
                        {mode === 'login' ? 'Logging in...' : 'Signing up...'}
                    </span>
                ) : (
                    mode === 'login' ? 'Log In' : 'Sign Up'
                )}
            </button>

            <div className="text-center text-sm text-gray-400">
                {mode === 'login' ? (
                    <>
                        Don't have an account?{' '}
                        <a href="/signup" className="text-[var(--primary)] hover:underline">
                            Sign up
                        </a>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <a href="/login" className="text-[var(--primary)] hover:underline">
                            Log in
                        </a>
                    </>
                )}
            </div>
        </form>
    );
}
