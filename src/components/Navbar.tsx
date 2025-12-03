"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 glass-card border-b transition-all duration-300 ${
          scrolled
            ? "border-matrix-green-primary/30 shadow-[0_0_20px_rgba(0,255,65,0.1)]"
            : "border-matrix-green-primary/20"
        }`}
      >
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-matrix-green-primary/5 to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ height: "200%" }}
          />
        </div>

        <div className="container-max relative">
          <div className="flex items-center justify-between py-3 md:py-4 px-4 md:px-6">
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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {[
                { href: "/donor", label: "For Donors", tag: "ZEC" },
                { href: "/recipient", label: "For Recipients", tag: "SBT" },
                { href: "/about", label: "How It Works", tag: "0x" },
              ].map((link, idx) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className="relative group px-3 lg:px-4 py-2 overflow-hidden"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    {/* Hover background */}
                    <div className="absolute inset-0 bg-matrix-green-primary/0 group-hover:bg-matrix-green-primary/10 transition-colors border border-transparent group-hover:border-matrix-green-primary/30" />

                    <div className="relative flex items-center gap-2">
                      <span className="text-matrix-green-primary group-hover:text-matrix-green-light transition-colors font-medium text-sm lg:text-base">
                        {link.label}
                      </span>
                      <span className="text-[10px] font-mono text-matrix-green-primary/50 group-hover:text-matrix-green-primary/80 transition-colors">
                        [{link.tag}]
                      </span>
                    </div>

                    {/* Underline effect */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-[1px] bg-matrix-green-primary"
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Wallet Connect */}
              <div className="hidden sm:block">
                <WalletConnect />
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                type="button"
                aria-label="Toggle navigation menu"
                className="md:hidden relative inline-flex items-center justify-center border border-matrix-green-primary/40 px-2.5 py-2 text-matrix-green-primary hover:bg-matrix-green-subtle transition-all hover:border-matrix-green-primary/60 hover:shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                onClick={() => setIsOpen((open) => !open)}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">Open main menu</span>
                <div className="space-y-1.5 w-5 h-4 relative">
                  <motion.span
                    className="block absolute h-0.5 w-5 bg-matrix-green-primary left-0"
                    animate={{
                      top: isOpen ? "50%" : "0%",
                      rotate: isOpen ? 45 : 0,
                      translateY: isOpen ? "-50%" : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block absolute top-1/2 -translate-y-1/2 h-0.5 w-5 bg-matrix-green-primary left-0"
                    animate={{ opacity: isOpen ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block absolute h-0.5 w-5 bg-matrix-green-primary left-0"
                    animate={{
                      bottom: isOpen ? "50%" : "0%",
                      rotate: isOpen ? -45 : 0,
                      translateY: isOpen ? "50%" : 0,
                    }}
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
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[64px] left-0 right-0 z-40 md:hidden"
          >
            <motion.div
              className="mx-4 my-2 glass-card border border-matrix-green-primary/50 overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.2)]"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
            >
              {/* Matrix grid background */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }} />
              </div>

              <div className="relative p-4 space-y-1">
                {[
                  { href: "/donor", label: "For Donors", icon: ">>", tag: "ZEC" },
                  { href: "/recipient", label: "For Recipients", icon: ">>", tag: "SBT" },
                  { href: "/about", label: "How It Works", icon: ">>", tag: "0x" },
                ].map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <Link href={link.href} onClick={closeMenu}>
                      <div className="group relative block w-full text-left px-4 py-3 text-matrix-green-primary hover:bg-matrix-green-subtle transition-all border border-transparent hover:border-matrix-green-primary/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                              {link.icon}
                            </span>
                            <span className="font-medium">{link.label}</span>
                          </div>
                          <span className="text-[10px] font-mono text-matrix-green-primary/50 group-hover:text-matrix-green-primary transition-colors">
                            [{link.tag}]
                          </span>
                        </div>
                        {/* Animated underline */}
                        <motion.div
                          className="absolute bottom-0 left-0 h-[1px] bg-matrix-green-primary"
                          initial={{ width: "0%" }}
                          whileHover={{ width: "100%" }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  className="pt-3 mt-3 border-t border-matrix-green-primary/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <WalletConnect />
                </motion.div>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="h-0.5 bg-gradient-to-r from-transparent via-matrix-green-primary to-transparent"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
