'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import $api from '@/utils/axios';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { API_ROUTES, ADMIN_ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await $api.post(API_ROUTES.AUTH.LOGIN, formData);

            toast.success('Đăng nhập thành công! Đang chuyển hướng...');
            await useAuthStore.getState().refreshUser();
            router.push(ADMIN_ROUTES.DASHBOARD);
            router.refresh();
        } catch (error) {
            console.error(error);
            const message =
                (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
                'Sai tài khoản hoặc mật khẩu';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 blur-[130px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-none p-8 sm:p-10 relative z-10"
            >
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="h-12 w-12 rounded-none bg-brand-primary/10 flex items-center justify-center mb-4">
                        <ShieldCheck className="text-brand-primary size-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">
                        SG VALVE
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 mb-5">
                        MANAGEMENT SYSTEM
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Đăng nhập hệ thống
                    </h1>
                    <p className="text-slate-500 text-xs mt-1.5 font-medium">
                        Vui lòng nhập thông tin tài khoản để bắt đầu làm việc
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-600">
                                Tên đăng nhập / Username
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                <Input
                                    type="text"
                                    required
                                    className="h-12 bg-slate-50 border border-slate-200 pl-11 text-sm font-medium tracking-tight rounded-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-600">
                                    Mật khẩu truy cập
                                </Label>
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="h-12 bg-slate-50 border border-slate-200 pl-11 pr-12 text-sm font-medium tracking-widest rounded-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all font-mono"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary hover:cursor-pointer transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-brand-primary hover:bg-brand-secondary hover:cursor-pointer text-white text-sm font-bold rounded-none transition-all flex items-center justify-center group active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin size-5 opacity-70" />
                        ) : (
                            <>
                                Bắt đầu phiên làm việc
                                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Footer Section */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Secured by SGV IT
                        </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        v1.2.4 Standard
                    </span>
                </div>
            </motion.div>

            {/* Footer minimal info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute bottom-6 left-0 w-full text-center z-10"
            >
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
                    Sài Gòn Valve Control System © 2026
                </p>
            </motion.div>
        </div>
    );
}
