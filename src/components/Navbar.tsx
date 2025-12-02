"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-matrix-green-dark/20"
      >
        <div className="container-max">
          <div className="flex items-center justify-between py-4 px-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={closeMenu}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-matrix-green-primary/20 blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative w-10 h-10 border-2 border-matrix-green-primary rounded-lg flex items-center justify-center font-mono font-bold text-matrix-green-primary">
                  Ø
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] uppercase tracking-[0.3em] text-matrix-green-primary/70">
                  O, PRIVØRA
                </span>
                <span className="text-2xl font-bold glow-text">PRIVØRA</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/donor"
                className="text-matrix-green-primary hover:text-matrix-green-light transition-colors font-medium"
              >
                For Donors
              </Link>
              <Link
                href="/recipient"
                className="text-matrix-green-primary hover:text-matrix-green-light transition-colors font-medium"
              >
                For Recipients
              </Link>
              <Link
                href="/about"
                className="text-matrix-green-primary hover:text-matrix-green-light transition-colors font-medium"
              >
                How It Works
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Wallet Connect */}
              <div className="hidden sm:block">
                <WalletConnect />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                aria-label="Toggle navigation menu"
                className="md:hidden inline-flex items-center justify-center rounded-md border border-matrix-green-primary/40 px-2.5 py-2 text-matrix-green-primary hover:bg-matrix-green-subtle transition-colors"
                onClick={() => setIsOpen((open) => !open)}
              >
                <span className="sr-only">Open main menu</span>
                <div className="space-y-1.5">
                  <span
                    className={`block h-0.5 w-5 bg-matrix-green-primary transition-transform ${
                      isOpen ? "translate-y-1.5 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-5 bg-matrix-green-primary transition-opacity ${
                      isOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-5 bg-matrix-green-primary transition-transform ${
                      isOpen ? "-translate-y-1.5 -rotate-45" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 left-0 right-0 z-40 md:hidden px-4"
        >
          <div className="glass-card border border-matrix-green-primary/40 p-4 space-y-2">
            <Link
              href="/donor"
              className="block w-full text-left px-3 py-2 rounded-md text-matrix-green-primary hover:bg-matrix-green-subtle transition-colors"
              onClick={closeMenu}
            >
              For Donors
            </Link>
            <Link
              href="/recipient"
              className="block w-full text-left px-3 py-2 rounded-md text-matrix-green-primary hover:bg-matrix-green-subtle transition-colors"
              onClick={closeMenu}
            >
              For Recipients
            </Link>
            <Link
              href="/about"
              className="block w-full text-left px-3 py-2 rounded-md text-matrix-green-primary hover:bg-matrix-green-subtle transition-colors"
              onClick={closeMenu}
            >
              How It Works
            </Link>

            <div className="pt-2 border-t border-matrix-green-primary/20">
              <WalletConnect />
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
