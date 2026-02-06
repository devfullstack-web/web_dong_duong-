"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Globe, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import { SITE_ROUTES } from "@/constants/routes";

interface NavLink {
  label: string;
  href: string;
  submenu?: { title: string; href: string }[];
  featured?: { title: string; desc: string; href: string }[];
}

const NAV_LINKS: NavLink[] = [
  { label: "TRANG CHỦ", href: SITE_ROUTES.HOME },
  { label: "GIỚI THIỆU", href: SITE_ROUTES.ABOUT },
  { 
    label: "GIẢI PHÁP", 
    href: "#",
    featured: [
      { 
        title: "Quản lý nước thông minh", 
        desc: "Giải pháp giám sát và điều khiển mạng lưới cấp nước tự động, tối ưu hóa hiệu suất và giảm thất thoát.",
        href: SITE_ROUTES.SOLUTIONS.WATER_MANAGEMENT 
      },
      { 
        title: "Nông nghiệp chính xác", 
        desc: "Ứng dụng IoT trong quản lý tưới tiêu và dinh dưỡng, giúp tăng năng suất và bảo vệ tài nguyên.",
        href: SITE_ROUTES.SOLUTIONS.AGRICULTURE 
      },
      // { 
      //   title: "Quan trắc nuôi trồng thủy sản", 
      //   desc: "Hệ thống cảnh báo sớm và kiểm soát chất lượng môi trường nước 24/7 cho trang trại.",
      //   href: SITE_ROUTES.SOLUTIONS.AQUACULTURE 
      // },
    ]
  },
  { label: "SẢN PHẨM", href: SITE_ROUTES.PRODUCTS },
  { label: "DỰ ÁN", href: SITE_ROUTES.PROJECTS },
  { label: "TIN TỨC", href: SITE_ROUTES.NEWS },
  { label: "TUYỂN DỤNG", href: SITE_ROUTES.RECRUITMENT },
  { label: "LIÊN HỆ", href: SITE_ROUTES.CONTACT },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 lg:top-8 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "lg:top-0 bg-white dark:bg-background shadow-md py-3" 
          : "bg-white dark:bg-background border-b border-border py-5"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href={SITE_ROUTES.HOME} className="relative h-14 w-56 shrink-0 group">
            <img
              src="/images/logo/logo.png"
              alt="Sài Gòn Valve Logo"
              className="object-contain group-hover:scale-105 transition-transform h-16 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {mounted && NAV_LINKS.map((link) => (
                  <NavigationMenuItem key={link.label}>
                    {"submenu" in link || "featured" in link ? (
                      <>
                        <NavigationMenuTrigger 
                          className={cn(
                            "h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-transparent hover:text-brand-primary active:bg-transparent data-[state=open]:text-brand-primary transition-colors",
                            pathname === link.href && "text-brand-primary"
                          )}
                        >
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-100 dark:ring-white/10">
                          <ul className={cn(
                            "grid gap-4 p-8",
                            link.featured ? "w-[700px] grid-cols-2" : "w-[280px] grid-cols-1"
                          )}>
                            {(link.submenu || link.featured)?.map((item: any) => (
                              <li key={item.title}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={item.href}
                                    className="group block select-none space-y-2 rounded-sm p-4 leading-none no-underline outline-none transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                                  >
                                    <div className="text-xs font-black uppercase tracking-tight group-hover:text-brand-primary transition-colors">{item.title as string}</div>
                                    {"desc" in item && <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground font-medium italic">{item.desc as string}</p>}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild active={pathname === link.href}>
                        <Link 
                          href={link.href}
                          className={cn(
                            "group inline-flex h-max w-max items-center justify-center rounded-sm bg-transparent px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-brand-primary focus:outline-none",
                            pathname === link.href ? "text-brand-primary" : "text-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Actions */}
            <div className="flex items-center gap-6 ml-8 pl-8 border-l border-slate-100 dark:border-white/10">
               <button className="text-foreground hover:text-brand-primary transition-colors transform hover:scale-110">
                 <Search size={18} />
               </button>
               <div className="flex items-center ml-2 border border-slate-100 dark:border-white/10 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-sm">
                  <Globe size={14} className="mr-2 text-brand-primary" />
                  <span className="text-[10px] font-black tracking-widest">VN</span>
               </div>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:text-brand-primary transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 overflow-y-auto origin-top"
          >
            <div className="container mx-auto px-6 py-12 space-y-10">
              {NAV_LINKS.map((link) => (
                <div key={link.label} className="space-y-6">
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-2xl font-black uppercase tracking-tighter hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                  {("submenu" in link || "featured" in link) && (
                    <div className="pl-6 grid grid-cols-1 gap-6 border-l-2 border-brand-primary/20">
                      {(link.submenu || link.featured)?.map((item: any) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand-primary transition-colors"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-12 border-t border-slate-100 dark:border-white/10 space-y-8">
                 <div className="flex items-center gap-6 text-muted-foreground group">
                    <div className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-brand-primary rounded-sm">
                       <Phone size={20} />
                    </div>
                    <span className="font-black text-sm tracking-widest">(028) 3535 8739</span>
                 </div>
                 <div className="flex items-center gap-6 text-muted-foreground group">
                    <div className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-brand-primary rounded-sm">
                       <Mail size={20} />
                    </div>
                    <span className="font-black text-sm tracking-widest uppercase">info@saigonvalve.vn</span>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
