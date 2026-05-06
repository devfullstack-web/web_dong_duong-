'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { User, Bell, Shield, Globe, Save, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/portal/ImageUploader';
import { useAuth } from '@/hooks/use-auth';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        avatarUrl: '',
        position: 'System Administrator', // Placeholder for now
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || '',
                position: 'System Administrator',
            });
        }
    }, [user]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await $api.patch(API_ROUTES.AUTH.PROFILE, {
                fullName: formData.fullName,
                phone: formData.phone,
                avatarUrl: formData.avatarUrl,
            });

            if (response.data.success) {
                toast.success('Cập nhật thông tin thành công');
                await refreshUser();
            }
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error('Lỗi khi cập nhật thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
                    Hồ sơ cá nhân
                </h1>
                <p className="text-slate-500 font-medium italic mt-1 text-sm">
                    Quản lý thông tin tài khoản của bạn trên hệ thống.
                </p>
            </div>

            <Card className="border-slate-100 rounded-none overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">
                        Thông tin cá nhân
                    </CardTitle>
                    <CardDescription className="text-xs font-medium italic">
                        Cập nhật thông tin định danh của bạn trên hệ thống.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div className="w-full md:w-64 mx-auto md:mx-0 max-w-64">
                            <ImageUploader
                                value={formData.avatarUrl}
                                onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                                aspectRatio="square"
                                className="avatar-uploader-portal"
                            />
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Họ và tên
                                    </Label>
                                    <Input
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fullName: e.target.value,
                                            })
                                        }
                                        className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Email liên hệ
                                    </Label>
                                    <Input
                                        disabled
                                        value={formData.email}
                                        className="h-12 border-slate-200 text-xs font-bold rounded-none bg-slate-50 text-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Số điện thoại
                                    </Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/30 p-4 md:p-8 border-t border-slate-50 flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-4 hover:cursor-pointer h-auto transition-all rounded-none"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 size-4" />
                        )}
                        Lưu thay đổi
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
