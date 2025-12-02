'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import WalletConnect from './WalletConnect';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-matrix-green-dark/20"
        >
            <div className="container-max">
                <div className="flex items-center justify-between py-4 px-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-matrix-green-primary/20 blur-xl group-hover:blur-2xl transition-all" />
                            <div className="relative w-10 h-10 border-2 border-matrix-green-primary rounded-lg flex items-center justify-center font-mono font-bold text-matrix-green-primary">
                                P
                            </div>
                        </div>
                        <span className="text-2xl font-bold glow-text">PRIVORA</span>
                    </Link>

                    {/* Navigation Links */}
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

                    {/* Wallet Connect */}
                    <WalletConnect />
                </div>
            </div>
        </motion.nav>
    );
}
