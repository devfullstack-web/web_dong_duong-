import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/portal/ChatWidget';

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <TopBar />
            <Header />
            <main className="relative flex min-h-screen flex-col">{children}</main>
            <Footer />
            <ChatWidget />
        </>
    );
}
