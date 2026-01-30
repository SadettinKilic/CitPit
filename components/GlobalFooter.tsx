import Link from 'next/link';
import { Github } from 'lucide-react';

export function GlobalFooter() {
    return (
        <footer className="w-full mt-12 py-6 border-t border-white/5 text-center">
            <Link
                href="https://github.com/SadettinKilic/CitPit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#F7931A] transition-colors duration-300"
            >
                <Github size={18} />
                <span className="text-sm font-mono">ÇıtPıt - GitHub</span>
            </Link>
            <p className="text-[10px] text-gray-700 mt-2 font-mono">
                Open Source Financial Tracking
            </p>
        </footer>
    );
}
