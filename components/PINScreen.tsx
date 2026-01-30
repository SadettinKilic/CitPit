'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Lock, User } from 'lucide-react';
import { registerUser, loginUser } from '@/lib/auth';

interface PINScreenProps {
    onUnlock: () => void;
}

export function PINScreen({ onUnlock }: PINScreenProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [nick, setNick] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (mode === 'register') {
                result = await registerUser(nick, pin);
            } else {
                result = await loginUser(nick, pin);
            }

            if (result.success) {
                onUnlock();
            } else {
                setError(result.error || 'Bir hata oluştu');
            }
        } catch (err) {
            setError('Beklenmeyen bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#030304] flex items-center justify-center p-4 bg-grid-pattern">
            {/* Radial Glow Background */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#F7931A] opacity-10 blur-[120px] rounded-full" />

            <div className="glass-light rounded-2xl p-8 w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] flex items-center justify-center glow-orange-lg mb-4">
                        <Lock size={40} className="text-white" />
                    </div>
                    <h2 className="text-xl font-heading font-bold text-white mb-1">
                        Hoş Geldiniz, ÇıtPıt
                    </h2>
                    <p className="text-sm text-gray-400 font-body">
                        Devam etmek için PIN girin
                    </p>
                </div>

                {/* Mode Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => {
                            setMode('login');
                            setError('');
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg font-mono text-sm transition-all ${mode === 'login'
                            ? 'bg-gradient-to-r from-[#EA580C]/20 to-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/50'
                            : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => {
                            setMode('register');
                            setError('');
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg font-mono text-sm transition-all ${mode === 'register'
                            ? 'bg-gradient-to-r from-[#EA580C]/20 to-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/50'
                            : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            type="text"
                            value={nick}
                            onChange={(e) => setNick(e.target.value)}
                            placeholder="Kullanıcı adı (nick)"
                            className="pl-10"
                            required
                        />
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>

                    <div className="relative">
                        <Input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="4 haneli PIN"
                            className="pl-10 text-center text-2xl font-mono tracking-widest"
                            required
                        />
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center font-body">
                            {error}
                        </p>
                    )}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'İşleniyor...' : mode === 'register' ? 'Kayıt Ol' : 'Giriş Yap'}
                    </Button>
                </form>

                <p className="text-xs text-[#94A3B8] text-center mt-4 font-body">
                    {mode === 'register'
                        ? 'Benzersiz bir kullanıcı adı seçin. PIN\'inizi unutmayın!'
                        : 'Kullanıcı adınız ve PIN\'iniz ile giriş yapın'}
                </p>
            </div>
        </div>
    );
}
