'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'motion/react';

const SOLUTIONS_DATA: Record<string, any> = {
    'quan-ly-nuoc-thong-minh': {
        brand: 'SÀI GÒN VALVE WATER',
        title: 'QUẢN LÝ CẤP NƯỚC THÔNG MINH',
        headerTitle: 'SÀI GÒN VALVE WATER - QUẢN LÝ CẤP NƯỚC THÔNG MINH',
        description:
            'Ngành cấp nước Việt Nam đang đứng trước những thách thức lớn. Tỷ lệ thất thoát nước sạch trên 20% mỗi năm không chỉ gây lãng phí hàng nghìn tỷ đồng mà còn ảnh hưởng trực tiếp đến hiệu quả kinh doanh của các đơn vị cấp nước. Bên cạnh đó, việc quản lý và vận hành mạng lưới đường ống theo phương pháp thủ công, thiếu chính xác và tốn nhiều nhân lực đã trở thành "nỗi đau" dai dẳng mà công nghệ cần phải giải quyết triệt để.',
        intro: 'Để đáp ứng nhu cầu cấp thiết này, SÀI GÒN VALVE đã phát triển giải pháp SÀI GÒN VALVE WATER - Chuyển đổi số ngành cấp nước, một nền tảng quản lý thông minh mang tính đột phá. Giải pháp này không chỉ giải quyết các vấn đề hiện hữu mà còn kiến tạo một tương lai nơi mọi nguồn lực được quản lý một cách thông minh và hiệu quả hơn.',
        banner: '/uploads/images/2026/02/02/1770024627773-di5jqj.png',
        image1: '/uploads/images/2026/02/02/1770024627773-di5jqj.png',
        image2: '/uploads/images/2026/02/02/1770024641404-d0g5xi.png',
        core: {
            title: 'THÀNH PHẦN CỐT LÕI',
            intro: 'Giải pháp SÀI GÒN VALVE WATER là sự kết hợp nhuần nhuyễn giữa các công nghệ lõi tiên tiến, tạo nên một hệ thống quản lý toàn diện:',
            items: [
                {
                    title: 'Nền tảng quản lý trên Bản đồ số (GIS)',
                    desc: 'Toàn bộ mạng lưới hạ tầng cấp nước, bao gồm đường ống, van, đồng hồ, trạm bơm, được số hóa và trực quan hóa trên một bản đồ số 2D/3D duy nhất. Điều này giúp các nhà quản lý có cái nhìn tổng quan và chính xác về toàn bộ hệ thống, dễ dàng quản lý tài sản và theo dõi trạng thái vận hành của từng thiết bị.',
                },
                {
                    title: 'Hệ thống cảm biến và Internet vạn vật (IoT)',
                    desc: 'Các cảm biến IoT được lắp đặt tại các điểm quan trọng để thu thập dữ liệu về áp lực, lưu lượng nước theo thời gian thực. Dữ liệu này là "linh hồn" của hệ thống, cung cấp thông tin sống động về "dòng chảy Việt" cho các nhà quản lý.',
                },
                {
                    title: 'Trí tuệ nhân tạo (AI) và Phân tích dữ liệu',
                    desc: 'Dữ liệu thu thập từ các cảm biến IoT được AI phân tích để khoanh vùng và cảnh báo sớm các điểm rò rỉ, vỡ ống. Bên cạnh đó, AI còn giúp phân tích dữ liệu lịch sử để dự báo các khu vực có nguy cơ xảy ra sự cố cao, từ đó hỗ trợ công tác bảo trì dự báo một cách chủ động và hiệu quả.',
                },
            ],
        },
        benefits: {
            title: 'GIÁ TRỊ SÀI GÒN VALVE MANG LẠI',
            intro: 'SÀI GÒN VALVE WATER không chỉ là một giải pháp công nghệ, mà còn là một khoản đầu tư mang lại lợi ích kinh tế và vận hành vượt trội:',
            items: [
                {
                    title: 'Giảm thất thoát nước đáng kể',
                    desc: 'Giải pháp giúp giảm tỷ lệ thất thoát nước sạch trên 15%.',
                },
                {
                    title: 'Tiết kiệm chi phí vận hành',
                    desc: 'Việc tối ưu hóa quy trình quản lý và vận hành giúp tiết kiệm chi phí lên đến hơn 20%.',
                },
                {
                    title: 'Tăng tốc độ xử lý sự cố',
                    desc: 'Khả năng phát hiện và cảnh báo sớm giúp tăng tốc độ xử lý sự cố gấp 2-3 lần.',
                },
                {
                    title: 'Hỗ trợ ra quyết định thông minh',
                    desc: 'Dashboard thống kê thông minh cung cấp các số liệu quan trọng, giúp lãnh đạo đưa ra các quyết định chính xác và kịp thời.',
                },
            ],
            outro: 'Với những ưu điểm trên, SÀI GÒN VALVE WATER là giải pháp toàn diện và tối ưu, giúp các doanh nghiệp ngành nước giải quyết các thách thức, nâng cao hiệu quả hoạt động và hướng đến mục tiêu phát triển bền vững.',
        },
    },
    'nong-nghiep-chinh-xac': {
        brand: 'SÀI GÒN VALVE FARM',
        title: 'NÔNG NGHIỆP CHÍNH XÁC',
        headerTitle: 'SÀI GÒN VALVE FARM - NÔNG NGHIỆP CHÍNH XÁC',
        description:
            'Giải pháp nông nghiệp chính xác giúp người nông dân và các trang trại quy mô lớn tự động hóa quy trình chăm sóc cây trồng dựa trên dữ liệu thực tế từ đất và môi trường.',
        intro: 'Bằng cách ứng dụng công nghệ IoT và cảm biến thông minh, chúng tôi giúp tối ưu hóa việc sử dụng tài nguyên, nâng cao năng suất và đảm bảo chất lượng nông sản một cách bền vững.',
        banner: '/uploads/images/2026/02/02/1770024634433-tfvl2o.png',
        image1: '/uploads/images/2026/02/02/1770024634433-tfvl2o.png',
        image2: '/uploads/images/2026/02/02/1770024627773-di5jqj.png',
        core: {
            title: 'THÀNH PHẦN CỐT LÕI',
            intro: 'Hệ thống nông nghiệp thông minh bao gồm các thành phần kỹ thuật then chốt:',
            items: [
                {
                    title: 'Quan trắc độ ẩm đất',
                    desc: 'Các cảm biến đa điểm đo chính xác độ ẩm, nhiệt độ và chỉ số EC trong đất theo thời gian thực.',
                },
                {
                    title: 'Tưới tiêu tự động',
                    desc: 'Hệ thống tự động lập lịch và kích hoạt tưới dựa trên ngưỡng độ ẩm thực tế của từng loại cây trồng.',
                },
                {
                    title: 'Phân tích khí hậu',
                    desc: 'Tích hợp dữ liệu trạm thời tiết để điều chỉnh lượng nước và phân bón phù hợp với điều kiện môi trường.',
                },
            ],
        },
        benefits: {
            title: 'GIÁ TRỊ SÀI GÒN VALVE MANG LẠI',
            intro: 'Giải pháp mang lại hiệu quả kinh tế rõ rệt thông qua việc tối ưu tài nguyên:',
            items: [
                {
                    title: 'Tiết kiệm tài nguyên',
                    desc: 'Tiết kiệm 30-50% lượng nước tưới và lượng phân bón sử dụng hàng năm.',
                },
                {
                    title: 'Nâng cao năng suất',
                    desc: 'Tăng sản lượng và cải thiện đồng nhất chất lượng nông sản thu hoạch.',
                },
                {
                    title: 'Giảm thiểu rủi ro',
                    desc: 'Phát hiện sớm các dấu hiệu bất thường của đất và cây trồng để ứng phó kịp thời.',
                },
            ],
            outro: 'SÀI GÒN VALVE FARM là người đồng hành tin cậy, giúp hiện đại hóa nền nông nghiệp Việt Nam theo hướng thông minh và bền vững.',
        },
    },
    'quan-trac-nuoi-trong-thuy-san': {
        brand: 'SÀI GÒN VALVE AQUA',
        title: 'QUAN TRẮC NUÔI TRỒNG THỦY SẢN',
        headerTitle: 'SÀI GÒN VALVE AQUA - QUAN TRẮC NUÔI TRỒNG THỦY SẢN',
        description:
            'Trong nuôi trồng thủy sản, chất lượng nước là yếu tố sống còn. Giải pháp quan trắc của chúng tôi cung cấp hệ thống giám sát liên tục các chỉ số quan trọng.',
        intro: 'Hệ thống tự động hóa việc theo dõi các chỉ số môi trường, giúp người nuôi giảm bớt lo âu và tối ưu hóa quy trình chăm sóc vật nuôi.',
        banner: '/uploads/images/2026/02/02/1770024641404-d0g5xi.png',
        image1: '/uploads/images/2026/02/02/1770024641404-d0g5xi.png',
        image2: '/uploads/images/2026/02/02/1770024634433-tfvl2o.png',
        core: {
            title: 'THÀNH PHẦN CỐT LÕI',
            intro: 'Các công nghệ giám sát môi trường nước tiên tiến nhất được tích hợp trong hệ thống:',
            items: [
                {
                    title: 'Giám sát Oxy hòa tan (DO)',
                    desc: 'Duy trì ngưỡng Oxy tối ưu, tự động kích hoạt máy quạt nước khi nồng độ Oxy giảm thấp.',
                },
                {
                    title: 'Đo lường pH và Salinity',
                    desc: 'Theo dõi liên tục độ pH và độ mặn để phát hiện kịp thời các tình huống sốc môi trường.',
                },
                {
                    title: 'Hệ thống cảnh báo SMS/App',
                    desc: 'Gửi thông báo tức thì đến điện thoại chủ trang trại khi có bất kỳ chỉ số nào vượt ngưỡng an toàn.',
                },
            ],
        },
        benefits: {
            title: 'GIÁ TRỊ SÀI GÒN VALVE MANG LẠI',
            intro: 'Giúp bảo vệ tài sản và nâng cao lợi nhuận cho các hộ nuôi trồng:',
            items: [
                {
                    title: 'Giảm tỷ lệ hao hụt',
                    desc: 'Hạn chế tối đa rủi ro vật nuôi chết hàng loạt do sốc nước hoặc thiếu Oxy.',
                },
                {
                    title: 'Tiết kiệm điện năng',
                    desc: 'Việc tự động hóa máy quạt nước giúp giảm chi phí điện vận hành lên đến 30%.',
                },
                {
                    title: 'Quản lý từ xa',
                    desc: 'Yên tâm theo dõi tình trạng ao nuôi mọi lúc mọi nơi thông qua ứng dụng di động.',
                },
            ],
            outro: 'Với SÀI GÒN VALVE AQUA, việc nuôi trồng thủy sản trở nên dễ dàng, khoa học và đạt hiệu quả cao hơn bao giờ hết.',
        },
    },
};

export default function SolutionDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const data = SOLUTIONS_DATA[slug];

    if (!data) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 antialiased">
            {/* Header / Hero Strip */}
            <header className="bg-brand-primary pt-32  text-center text-white relative">
                <div className="container mx-auto px-4 py-10  space-y-4">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-widest leading-tight">
                        {data.headerTitle}
                    </h1>
                    <nav className="flex items-center justify-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
                        <Link href="/" className="hover:text-brand-accent transition-colors">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <span className="text-brand-accent font-black">Giải pháp</span>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto  px-4 sm:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
                {/* 1. Overview Section */}
                <article className="space-y-10">
                    {/* Brand Heading with Gold Bar */}
                    <div className="flex gap-4 sm:gap-6 border-l-[6px] border-brand-accent pl-6 py-1">
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary uppercase tracking-tight leading-none">
                                {data.brand}
                            </h2>
                            <h3 className="text-xl sm:text-2xl font-black text-brand-secondary uppercase tracking-tight">
                                {data.title}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.description}
                        </p>

                        <div className="relative aspect-video w-full overflow-hidden shadow-2xl ring-1 ring-slate-100 rounded-sm">
                            <Image
                                src={data.image1}
                                alt={data.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.intro}
                        </p>
                    </div>
                </article>

                {/* 2. Core Components Section */}
                <section className="space-y-10 sm:space-y-12">
                    <div className="text-center">
                        <h4 className="text-xl sm:text-2xl font-black text-brand-accent uppercase tracking-[0.25em]">
                            {data.core.title}
                        </h4>
                    </div>

                    <div className="space-y-8">
                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.core.intro}
                        </p>

                        <div className="space-y-6">
                            {data.core.items.map((item: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                                        <strong className="font-extrabold text-slate-900 uppercase tracking-tight">
                                            {item.title}:
                                        </strong>{' '}
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative aspect-video lg:aspect-21/9 w-full mt-10 overflow-hidden shadow-2xl rounded-sm">
                        <Image
                            src={data.image2}
                            alt="Deployment Visual"
                            fill
                            className="object-cover"
                        />
                    </div>
                </section>

                {/* 3. Value Proposition Section */}
                <section className="space-y-10 sm:space-y-12 pb-20">
                    <div className="text-center">
                        <h4 className="text-xl sm:text-2xl font-black text-brand-accent uppercase tracking-[0.25em]">
                            {data.benefits.title}
                        </h4>
                    </div>

                    <div className="space-y-8">
                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.benefits.intro}
                        </p>

                        <div className="space-y-6">
                            {data.benefits.items.map((item: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                                        <strong className="font-extrabold text-slate-900 uppercase tracking-tight">
                                            {item.title}:
                                        </strong>{' '}
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium pt-12">
                            {data.benefits.outro}
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
