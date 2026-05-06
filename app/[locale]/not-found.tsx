"use client";

import Link from "next/link";
import { Button } from "@/components/portal/../../components/ui/button";
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block"
        >
          <h1 className="text-[180px] font-black leading-none text-slate-200 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-32 w-32 rounded-full bg-brand-primary/10 flex items-center justify-center animate-pulse">
                <Search size={64} className="text-brand-primary" />
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Trang không tồn tại</h2>
          <p className="text-slate-500 font-medium italic text-lg max-w-md mx-auto">
            Rất tiếc, nội dung bạn đang tìm kiếm không còn tồn tại hoặc đã bị di dời.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest px-8 py-4 h-auto bg-slate-100 hover:cursor-pointer text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all "
          >
            <ArrowLeft className="mr-2 size-4" /> Quay lại
          </Button>
          <Link href="/portal" className="w-full sm:w-auto">
            <Button className="w-full bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-4 hover:cursor-pointer h-auto transition-all  border-none shadow-none">
              <Home className="mr-2 size-4" /> Về Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="pt-12 flex items-center justify-center gap-2 text-slate-400"
        >
           <AlertCircle size={14} />
           <span className="text-[10px] font-bold uppercase tracking-[0.2em]">SGV VALVES SYSTEM PORTAL</span>
        </motion.div>
      </div>
    </div>
  );
}
