import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ title }: { title: string }) => (
  <nav className="bg-white border-b border-slate-200 py-3 px-4">
    <div className="max-w-7xl mx-auto flex items-center text-sm text-slate-500">
      <Link href="/" className="hover:text-blue-600 flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      <ChevronRight className="w-4 h-4 mx-2" />
      <Link href="/oliygoh/" className="hover:text-blue-600">
        Oliygohlar
      </Link>
      <ChevronRight className="w-4 h-4 mx-2" />
      <span className="text-slate-900 font-medium line-clamp-1">{title}</span>
    </div>
  </nav>
);

export default Breadcrumb;
