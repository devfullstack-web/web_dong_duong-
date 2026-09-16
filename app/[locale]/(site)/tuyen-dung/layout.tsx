import type { Metadata } from 'next';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isZh = locale === 'zh';
    const isEn = locale === 'en';

    const title = isZh
        ? '诚聘英才 | 加入东洋集团 暖通机电与建材领航团队'
        : isEn
        ? 'Careers | Join Dong Duong Corporation M&E & Building Materials'
        : 'Tuyển Dụng Nhân Tài | Gia Nhập Đông Dương Corporation';

    const description = isZh
        ? '东洋集团诚聘暖通空调设计工程师、建材工程大客户经理、机电安装项目主管与供应链人才。完善福利与广阔晋升空间。'
        : isEn
        ? 'Explore career opportunities at Dong Duong Corporation. Join our engineering, B2B sales, and M&E project management teams.'
        : 'Cơ hội nghề nghiệp hấp dẫn tại Đông Dương Corporation. Tuyển dụng kỹ sư HVAC Chiller/VRV, chuyên viên kinh doanh dự án gạch ốp lát và quản lý thi công.';

    return {
        title: { absolute: title },
        description,
    };
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
