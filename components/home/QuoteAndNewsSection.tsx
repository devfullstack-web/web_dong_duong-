'use client';

import * as React from 'react';
import Image from 'next/image';
import { Calendar, Loader2, Send } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { useLocale, useTranslations } from 'next-intl';
import TechSvgBackground from '@/components/ui/TechSvgBackground';

interface NewsItem {
    id: string;
    title: string;
    title_localized?: { vi?: string; en?: string; zh?: string } | null;
    slug: string;
    image_url?: string | null;
    published_at?: string | Date | null;
    created_at?: string | Date | null;
}

interface Props {
    articles?: NewsItem[];
}

export default function QuoteAndNewsSection({ articles }: Props) {
    const locale = useLocale();
    const t = useTranslations('Home');

    const newsList = React.useMemo(() => {
        if (!articles || articles.length === 0) return [];
        const isZh = locale === 'zh';
        const isEn = locale === 'en';
        const mapped = articles.map((a) => ({
            id: a.id,
            title: (isZh && a.title_localized?.zh) ? a.title_localized.zh : (isEn && a.title_localized?.en) ? a.title_localized.en : (a.title_localized?.vi || a.title),
            slug: a.slug,
            image_url: a.image_url || '/images/dongduong/news-1.png',
            published_at: a.published_at || a.created_at || new Date().toISOString(),
        }));
        return mapped.slice(0, 4);
    }, [articles, locale]);

    // Form State
    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error(locale === 'zh' ? '请填写姓名' : locale === 'en' ? 'Please enter your full name' : 'Vui lòng nhập họ và tên');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            toast.error(locale === 'zh' ? '请填写有效的电子邮箱' : locale === 'en' ? 'Please enter a valid email address' : 'Vui lòng nhập địa chỉ email hợp lệ');
            return;
        }
        if (!phone.trim() || phone.trim().length < 10) {
            toast.error(locale === 'zh' ? '请填写有效的联系电话（至少10位数字）' : locale === 'en' ? 'Please enter a valid phone number (at least 10 digits)' : 'Vui lòng nhập số điện thoại hợp lệ (ít nhất 10 số)');
            return;
        }
        if (!message.trim() || message.trim().length < 10) {
            toast.error(locale === 'zh' ? '咨询内容至少需要10个字符' : locale === 'en' ? 'Inquiry message must be at least 10 characters' : 'Nội dung yêu cầu phải có ít nhất 10 ký tự');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await $api.post(API_ROUTES.CONTACTS, {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                message: message.trim(),
                subject: locale === 'zh' ? '东洋集团工程设备与建材在线询价咨询' : locale === 'en' ? 'Quote & Consultation Request - Dong Duong Equipment' : 'Đăng ký báo giá & tư vấn thiết bị Đông Dương',
            });

            if (res.data?.success) {
                toast.success(locale === 'zh' ? '提交成功！我们的技术团队将尽快与您取得联系。' : locale === 'en' ? 'Quote request sent successfully! Our team will contact you shortly.' : 'Gửi đăng ký báo giá thành công! Đội ngũ chuyên gia sẽ liên hệ bạn sớm.');
                setName('');
                setPhone('');
                setEmail('');
                setMessage('');
            } else {
                toast.error(res.data?.error || (locale === 'zh' ? '提交失败，请重试' : locale === 'en' ? 'An error occurred, please try again' : 'Có lỗi xảy ra, vui lòng thử lại'));
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || (locale === 'zh' ? '提交失败，请稍后重试。' : locale === 'en' ? 'Failed to send request. Please try again later.' : 'Gửi yêu cầu thất bại. Vui lòng thử lại sau.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateVal?: string | Date | null) => {
        if (!dateVal) return locale === 'zh' ? '2026年6月15日' : locale === 'en' ? 'Jun 15, 2026' : '15 tháng 06, 2026';
        try {
            const d = new Date(dateVal);
            if (locale === 'zh') {
                return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
            }
            if (locale === 'en') {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
            return `${d.getDate()} tháng ${String(d.getMonth() + 1).padStart(2, '0')}, ${d.getFullYear()}`;
        } catch {
            return locale === 'zh' ? '2026年6月15日' : locale === 'en' ? 'Jun 15, 2026' : '15 tháng 06, 2026';
        }
    };

    return (
        <section id="quote-form" className="relative py-16 sm:py-20 bg-slate-50/70 border-t border-slate-100 overflow-hidden">
            {/* E-Commerce Project Quoting Portal Background */}
            <TechSvgBackground variant="ecommerce-portal" glowColor="cyan" className="absolute inset-0 z-0" />

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Quote Form Card */}
                    <div className="lg:col-span-5 bg-[#0B2545] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        {/* Golden Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#E5B869] uppercase tracking-wider">
                                {t('quoteFormTitle')}
                            </h2>
                            <p className="text-base sm:text-lg text-slate-200 mt-2 font-medium">
                                {t('quoteFormSubtitle')}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-base sm:text-lg font-bold text-slate-200 mb-2">
                                    {t('quoteFormName')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={locale === 'zh' ? '张先生 / 李女士' : locale === 'en' ? 'John Doe' : 'Nguyễn Văn A'}
                                    required
                                    className="w-full px-4 py-3.5 bg-white text-slate-900 rounded-xl text-base sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-base sm:text-lg font-bold text-slate-200 mb-2">
                                        {t('quoteFormPhone')}
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0901 234 567"
                                        required
                                        className="w-full px-4 py-3.5 bg-white text-slate-900 rounded-xl text-base sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-base sm:text-lg font-bold text-slate-200 mb-2">
                                        {t('quoteFormEmail')}
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="info@dongduong.vn"
                                        required
                                        className="w-full px-4 py-3.5 bg-white text-slate-900 rounded-xl text-base sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-base sm:text-lg font-bold text-slate-200 mb-2">
                                    {t('quoteFormMessage')}
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t('quoteFormMessagePlaceholder')}
                                    rows={3}
                                    required
                                    className="w-full px-4 py-3.5 bg-white text-slate-900 rounded-xl text-base sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 py-4 sm:py-4.5 bg-gradient-to-r from-[#E5B869] to-[#D49B45] hover:from-[#ECC880] hover:to-[#DEAE5A] text-slate-950 text-base sm:text-lg font-black uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{t('quoteFormSending')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t('quoteFormSubmit')}</span>
                                        <Send className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            {/* Note */}
                            <p className="text-center text-sm sm:text-base text-slate-200 pt-2 font-medium">
                                {t('quoteFormNote')}
                            </p>
                        </form>
                    </div>

                    {/* Right Column: Latest News */}
                    <div className="lg:col-span-7 flex flex-col justify-between h-full">
                        <div>
                            <div className="border-b-2 border-slate-200 pb-3.5 mb-6">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B2545] uppercase tracking-tight">
                                    {t('latestNewsTitle')}
                                </h2>
                            </div>

                            {/* News List */}
                            {newsList.length > 0 ? (
                                <div className="space-y-4 sm:space-y-5">
                                    {newsList.map((item) => (
                                        <div key={item.id}>
                                            <Link
                                                href={`/tin-tuc/${item.slug}` as "/tin-tuc"}
                                                className="flex items-center gap-4 sm:gap-6 group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all block"
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative w-28 sm:w-40 h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                                    <Image
                                                        src={item.image_url || '/images/dongduong/news-1.png'}
                                                        alt={item.title}
                                                        fill
                                                        sizes="(max-width: 640px) 112px, 160px"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>

                                                {/* News Meta & Title */}
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-semibold">
                                                        <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                                                        <span>{formatDate(item.published_at)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-base font-medium">
                                    {t('updatingNews')}
                                </div>
                            )}
                        </div>

                        {/* View all news CTA */}
                        <div className="pt-6 flex justify-end">
                            <Link
                                href="/tin-tuc"
                                className="text-base sm:text-lg font-black uppercase text-[#0B2545] hover:text-amber-600 tracking-wider inline-flex items-center gap-2 group transition-colors"
                            >
                                <span>{t('viewAllNews')}</span>
                                <span className="group-hover:translate-x-1.5 transition-transform font-black">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
