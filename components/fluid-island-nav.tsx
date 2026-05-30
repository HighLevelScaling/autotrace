"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { MobileMenuOverlay } from "./mobile-menu-overlay";

const links = [
  { href: "/", label: "Home" },
  { href: "/auctions", label: "Auctions" },
  { href: "/pricebeacon", label: "PriceBeacon" },
  { href: "/hottest", label: "Hottest" },
  { href: "/bulk", label: "Bulk Upload" },
  { href: "/dashboard", label: "Dealer Dashboard" },
];

const transition = {
  duration: 0.7,
  ease: [0.32, 0.72, 0, 1] as const,
};

export function FluidIslandNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <nav className="mt-6 mx-auto w-max flex items-center gap-6 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 px-5 py-3 pointer-events-auto">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/25 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-[#6366f1]/25 group-hover:border-[#6366f1]/40">
              <Search
                className="w-3.5 h-3.5 text-[#6366f1]"
                strokeWidth={1}
              />
            </div>
            <span className="text-white font-medium text-sm tracking-tight">
              AutoTrace
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm tracking-tight rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                  pathname === link.href
                    ? "text-white bg-white/[0.06]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-5 h-5 flex flex-col items-center justify-center gap-[5px] focus:outline-none"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={
                isOpen
                  ? { y: 6.5, rotate: 45 }
                  : { y: 0, rotate: 0 }
              }
              transition={transition}
              className="block w-5 h-[1.5px] bg-white/70 rounded-full origin-center"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1] as const,
              }}
              className="block w-5 h-[1.5px] bg-white/70 rounded-full"
            />
            <motion.span
              animate={
                isOpen
                  ? { y: -6.5, rotate: -45 }
                  : { y: 0, rotate: 0 }
              }
              transition={transition}
              className="block w-5 h-[1.5px] bg-white/70 rounded-full origin-center"
            />
          </button>
        </nav>
      </header>

      <MobileMenuOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
