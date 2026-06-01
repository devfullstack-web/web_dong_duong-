'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Save, 
    Loader2, 
    User, 
    Globe, 
    Building, 
    Phone, 
    Mail, 
    Clock, 
    Share2,
    Shield
} from 'lucide-react';
import { ImageUploader } from '@/components/portal/ImageUploader';
import { usePermissions } from '@/hooks/use-permissions';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user, refreshUser } = usePermissions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        avatarUrl: '',
        position: 'System Administrator',
    });

    // Web Settings States
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [siteInfo, setSiteInfo] = useState({
        site_name: '',
        site_short_name: '',
        site_full_name: '',
        site_address: '',
        site_phone: '',
        site_phone_raw: '',
        site_email: '',
        site_support_email: '',
        site_website: '',
        site_website_label: '',
        site_facebook: '',
        site_linkedin: '',
        site_youtube: '',
        site_zalo: '',
        site_working_hours_weekdays: '',
        site_working_hours_saturday: '',
        site_working_hours_sunday: '',
        site_tax_code: '',
        site_founded_year: '',
        site_slogan: '',
        site_copyright_name: '',
        site_copyright_text: '',
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

    const fetchSiteSettings = async () => {
        setIsLoadingSettings(true);
        try {
            const response = await $api.get('/settings/site-info');
            if (response.data.success) {
                const data = response.data.data;
                const raw = data.raw || {};
                setSiteInfo({
                    site_name: raw.site_name || data.name || '',
                    site_short_name: raw.site_short_name || data.shortName || '',
                    site_full_name: raw.site_full_name || data.fullName || '',
                    site_address: raw.site_address || data.address || '',
                    site_phone: raw.site_phone || data.phone || '',
                    site_phone_raw: raw.site_phone_raw || data.phoneRaw || '',
                    site_email: raw.site_email || data.email || '',
                    site_support_email: raw.site_support_email || data.supportEmail || '',
                    site_website: raw.site_website || data.website || '',
                    site_website_label: raw.site_website_label || data.websiteLabel || '',
                    site_facebook: raw.site_facebook || data.social?.facebook || '',
                    site_linkedin: raw.site_linkedin || data.social?.linkedin || '',
                    site_youtube: raw.site_youtube || data.social?.youtube || '',
                    site_zalo: raw.site_zalo || data.social?.zalo || '',
                    site_working_hours_weekdays: raw.site_working_hours_weekdays || data.workingHours?.weekdays || '',
                    site_working_hours_saturday: raw.site_working_hours_saturday || data.workingHours?.saturday || '',
                    site_working_hours_sunday: raw.site_working_hours_sunday || data.workingHours?.sunday || '',
                    site_tax_code: raw.site_tax_code || data.taxCode || '',
                    site_founded_year: raw.site_founded_year || (data.foundedYear ? String(data.foundedYear) : ''),
                    site_slogan: raw.site_slogan || data.slogan || '',
                    site_copyright_name: raw.site_copyright_name || '',
                    site_copyright_text: raw.site_copyright_text || '',
                });
            }
        } catch (error) {
            console.error('Failed to load site settings', error);
            toast.error('Không thể tải cấu hình website');
        } finally {
            setIsLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchSiteSettings();
    }, []);

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

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const response = await $api.patch('/settings/site-info', siteInfo);
            if (response.data.success) {
                toast.success('Cập nhật cấu hình website thành công');
                await fetchSiteSettings();
            }
        } catch (error) {
            console.error('Failed to save site settings', error);
            toast.error('Lỗi khi cập nhật cấu hình website');
        } finally {
            setIsSavingSettings(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
                    Cài đặt hệ thống
                </h1>
                <p className="text-slate-500 font-medium italic mt-1 text-sm">
                    Quản lý tài khoản cá nhân và cấu hình hiển thị của website.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-100/70 p-1 rounded-none border border-slate-200/50 w-full sm:w-auto flex h-auto">
                    <TabsTrigger 
                        value="profile" 
                        className="rounded-none font-bold text-xs uppercase tracking-wider py-3 px-6 data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm flex items-center gap-2 flex-1 sm:flex-initial"
                    >
                        <User size={14} />
                        Hồ sơ cá nhân
                    </TabsTrigger>
                    <TabsTrigger 
                        value="site-info" 
                        className="rounded-none font-bold text-xs uppercase tracking-wider py-3 px-6 data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm flex items-center gap-2 flex-1 sm:flex-initial"
                    >
                        <Globe size={14} />
                        Thông tin website
                    </TabsTrigger>
                </TabsList>

                {/* Tab Profile */}
                <TabsContent value="profile" className="outline-none">
                    <Card className="border-slate-100 rounded-none overflow-hidden shadow-sm">
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
                </TabsContent>

                {/* Tab Site Info settings */}
                <TabsContent value="site-info" className="outline-none">
                    {isLoadingSettings ? (
                        <Card className="border-slate-100 rounded-none h-96 flex items-center justify-center">
                            <Loader2 className="animate-spin text-brand-primary size-8" />
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Section 1: Thông tin doanh nghiệp */}
                            <Card className="border-slate-100 rounded-none overflow-hidden shadow-sm">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Building size={16} className="text-brand-primary" />
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">
                                            Thông tin doanh nghiệp & SEO
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs font-medium italic">
                                        Cấu hình các thông tin pháp lý, thương hiệu và slogan chính của công ty.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Tên thương hiệu (ngắn gọn)
                                        </Label>
                                        <Input
                                            value={siteInfo.site_name}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_name: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: Sài Gòn Valve"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Tên viết tắt
                                        </Label>
                                        <Input
                                            value={siteInfo.site_short_name}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_short_name: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: SGV"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Tên đầy đủ công ty
                                        </Label>
                                        <Input
                                            value={siteInfo.site_full_name}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_full_name: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: CÔNG TY TNHH SÀI GÒN VALVE"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Mã số thuế
                                        </Label>
                                        <Input
                                            value={siteInfo.site_tax_code}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_tax_code: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Nhập mã số thuế"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Năm thành lập
                                        </Label>
                                        <Input
                                            type="number"
                                            value={siteInfo.site_founded_year}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_founded_year: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: 2020"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Slogan / Tuyên bố sứ mệnh
                                        </Label>
                                        <Textarea
                                            value={siteInfo.site_slogan}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_slogan: e.target.value })}
                                            className="border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary min-h-[80px]"
                                            placeholder="Khẩu hiệu hiển thị ở Footer và Metadata"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 2: Thông tin liên hệ */}
                            <Card className="border-slate-100 rounded-none overflow-hidden shadow-sm">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-brand-primary" />
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">
                                            Thông tin liên hệ chính
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs font-medium italic">
                                        Số điện thoại hiển thị, email và địa chỉ hiển thị chính thức trên website.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Số điện thoại / Hotline hiển thị
                                        </Label>
                                        <Input
                                            value={siteInfo.site_phone}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_phone: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: 0903.123.456"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Hotline gọi trực tiếp (chỉ ghi số liền nhau)
                                        </Label>
                                        <Input
                                            value={siteInfo.site_phone_raw}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_phone_raw: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: 0903123456"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Email liên hệ chính
                                        </Label>
                                        <Input
                                            type="email"
                                            value={siteInfo.site_email}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_email: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: contact@saigonvalve.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Email hỗ trợ kỹ thuật
                                        </Label>
                                        <Input
                                            type="email"
                                            value={siteInfo.site_support_email}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_support_email: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Ví dụ: support@saigonvalve.com"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Địa chỉ văn phòng / Nhà xưởng
                                        </Label>
                                        <Input
                                            value={siteInfo.site_address}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_address: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Địa chỉ đầy đủ hiển thị ở Footer và Liên hệ"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 3: Mạng xã hội & Liên kết */}
                            <Card className="border-slate-100 rounded-none overflow-hidden shadow-sm">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Share2 size={16} className="text-brand-primary" />
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">
                                            Mạng xã hội & Liên kết
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs font-medium italic">
                                        Các tài khoản mạng xã hội và link website chính thức để khách hàng kết nối.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            URL Website
                                        </Label>
                                        <Input
                                            value={siteInfo.site_website}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_website: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="https://saigonvalve.vn"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Nhãn website
                                        </Label>
                                        <Input
                                            value={siteInfo.site_website_label}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_website_label: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="saigonvalve.vn"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Facebook Page URL
                                        </Label>
                                        <Input
                                            value={siteInfo.site_facebook}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_facebook: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Link trang Facebook"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Zalo chat URL
                                        </Label>
                                        <Input
                                            value={siteInfo.site_zalo}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_zalo: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Link chat Zalo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Kênh YouTube URL
                                        </Label>
                                        <Input
                                            value={siteInfo.site_youtube}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_youtube: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Link kênh Youtube"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            LinkedIn Company URL
                                        </Label>
                                        <Input
                                            value={siteInfo.site_linkedin}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_linkedin: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Link trang Linkedin"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 4: Giờ làm việc & Copyright */}
                            <Card className="border-slate-100 rounded-none overflow-hidden shadow-sm">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-brand-primary" />
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">
                                            Thời gian làm việc & Copyright
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs font-medium italic">
                                        Cấu hình thời gian phục vụ khách hàng và dòng bản quyền dưới chân trang.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Giờ làm việc Ngày thường
                                        </Label>
                                        <Input
                                            value={siteInfo.site_working_hours_weekdays}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_working_hours_weekdays: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Thứ 2 - Thứ 6: 8:00 - 17:00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Giờ làm việc Thứ Bảy
                                        </Label>
                                        <Input
                                            value={siteInfo.site_working_hours_saturday}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_working_hours_saturday: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Thứ 7: 8:00 - 12:00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Giờ làm việc Chủ Nhật
                                        </Label>
                                        <Input
                                            value={siteInfo.site_working_hours_sunday}
                                            onChange={(e) => setSiteInfo({ ...siteInfo, site_working_hours_sunday: e.target.value })}
                                            className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                            placeholder="Nghỉ hoặc Đóng cửa"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-3 border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Tên bản quyền sở hữu (Copyright Name)
                                            </Label>
                                            <Input
                                                value={siteInfo.site_copyright_name}
                                                onChange={(e) => setSiteInfo({ ...siteInfo, site_copyright_name: e.target.value })}
                                                className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                                placeholder="Ví dụ: Sài Gòn Valve"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Mô tả bản quyền đi kèm (Copyright Text)
                                            </Label>
                                            <Input
                                                value={siteInfo.site_copyright_text}
                                                onChange={(e) => setSiteInfo({ ...siteInfo, site_copyright_text: e.target.value })}
                                                className="h-12 border-slate-200 text-xs font-bold rounded-none focus:ring-brand-primary"
                                                placeholder="Ví dụ: Bảo lưu mọi quyền."
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/30 p-4 md:p-8 border-t border-slate-50 flex justify-end">
                                    <Button
                                        onClick={handleSaveSettings}
                                        disabled={isSavingSettings}
                                        className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-4 hover:cursor-pointer h-auto transition-all rounded-none"
                                    >
                                        {isSavingSettings ? (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 size-4" />
                                        )}
                                        Lưu cấu hình website
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
