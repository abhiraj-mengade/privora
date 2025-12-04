"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/donor", label: "For Patrons" },
    { href: "/recipient", label: "For Builders" },
    { href: "/about", label: "How It Works" },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <header
      className={`w-full fixed top-0 z-50 border-b transition-all ${
        scrolled
          ? "border-matrix-green-primary/30"
          : "border-matrix-green-primary/20"
      } bg-black/30 backdrop-blur-xl`}
    >
      <nav className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 h-16 md:h-20">
        {/* Left: Logo + Desktop Links */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 md:gap-3 group relative z-10"
            onClick={closeMenu}
          >
            <div className="relative">
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 bg-matrix-green-primary/30 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Corner brackets */}
              <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-matrix-green-light" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-matrix-green-light" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-matrix-green-light" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-matrix-green-light" />
              </div>
              <motion.div
                className="relative w-9 h-9 md:w-10 md:h-10 border-2 border-matrix-green-primary flex items-center justify-center font-mono font-bold text-matrix-green-primary bg-black/80"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                Ø
              </motion.div>
            </div>
            <div className="flex flex-col leading-tight">
              <motion.span
                className="text-[9px] md:text-[11px] uppercase tracking-[0.25em] md:tracking-[0.3em] text-matrix-green-primary/70 font-mono"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                O, PRIVØRA
              </motion.span>
              <span className="text-xl md:text-2xl font-bold glow-text font-mono tracking-tight">
                PRIVØRA
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className="relative group px-1 py-0.5"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * (idx + 1) }}
                  >
                    <span
                      className={`text-sm lg:text-base font-medium transition-colors ${
                        isActive
                          ? "text-matrix-green-primary"
                          : "text-white/80 group-hover:text-matrix-green-primary"
                      }`}
                    >
                      {link.label}
                    </span>
                    {/* Underline effect */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-[1px] bg-matrix-green-primary"
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Wallet + Mobile Toggle */}
        <div className="flex items-center gap-3 md:gap-4">
          <motion.button
            type="button"
            aria-label="Toggle navigation menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-matrix-green-primary hover:text-matrix-green-light transition-colors"
            onClick={() => setIsOpen((o) => !o)}
            whileTap={{ scale: 0.95 }}
          >
            <span className="sr-only">Open main menu</span>
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <motion.span
                className="block h-0.5 w-6 bg-current"
                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 9 : 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-current"
                animate={{ opacity: isOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-current"
                animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -9 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </div>
            {/* Blinking indicator */}
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-matrix-green-light rounded-full"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black/95 backdrop-blur-lg border-t border-matrix-green-primary/20"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMenu}>
                  <div className="block px-4 py-3 text-base text-white/80 hover:text-matrix-green-primary hover:bg-matrix-green-primary/5 transition-all duration-200 rounded-md">
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
