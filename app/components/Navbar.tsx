"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">GraphQL Visualizer</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>📊</span>
              <span>Grafo</span>
            </Link>

            <Link
              href="/people"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/people")
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>👥</span>
              <span>Personas</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
