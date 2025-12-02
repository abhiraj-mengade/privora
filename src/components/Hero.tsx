'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center section-padding">
            <div className="container-max">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
                    {/* Main Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        <p className="text-xs uppercase tracking-[0.3em] text-matrix-green-primary/70 mb-4">
                            Zcash × NEAR × Zero-Knowledge
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-semibold md:font-bold mb-6 leading-tight tracking-tight">
                            <span className="glow-text">Private</span>{' '}
                            <span className="text-white/90">capital for</span>{' '}
                            <span className="glow-text">public</span>{' '}
                            <span className="text-white">impact.</span>
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25 }}
                        className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed max-w-xl"
                    >
                        Matching anonymous donors with verified-but-pseudonymous builders, students,
                        and activists. Funds move through shielded Zcash addresses, coordination
                        lives on NEAR, guarantees come from{' '}
                        <span className="text-matrix-green-primary font-semibold">
                            zk-proofs
                        </span>
                        —identity never leaves the dark.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
                    >
                        <Link href="/donor" className="w-full sm:w-auto">
                            <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                Start giving
                                <span className="text-xs font-mono text-black/70">ZEC → SBT</span>
                            </button>
                        </Link>
                        <Link href="/recipient" className="w-full sm:w-auto">
                            <button className="btn-outline w-full sm:w-auto">
                                Apply as recipient
                            </button>
                        </Link>
                    </motion.div>

                    {/* Right rail: system snapshot */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="glass-card border border-matrix-green-primary/30 p-5 md:p-6 lg:p-7 relative overflow-hidden"
                    >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-matrix opacity-10 mix-blend-soft-light" />

                        <p className="text-xs font-mono text-matrix-green-primary/70 mb-3">
                            LIVE COORDINATION LAYER
                        </p>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Donor intents</span>
                                <span className="rounded-full bg-black/70 px-3 py-1 font-mono text-xs text-matrix-green-primary border border-matrix-green-primary/30">
                                    private
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Recipient proofs</span>
                                <span className="text-xs font-mono text-matrix-green-primary/80">
                                    zk-SNARKs, Semaphore
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Settlement</span>
                                <span className="text-xs font-mono text-matrix-green-primary/80">
                                    ZEC shielded
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-matrix-green-primary/20">
                            <p className="text-xs text-gray-500 mb-2">Powered by</p>
                            <div className="flex flex-wrap gap-3 text-[11px] font-mono text-matrix-green-primary/70">
                                <span className="px-2 py-1 rounded-full bg-black/60 border border-matrix-green-primary/30">
                                    Zcash
                                </span>
                                <span className="px-2 py-1 rounded-full bg-black/60 border border-matrix-green-primary/30">
                                    NEAR Protocol
                                </span>
                                <span className="px-2 py-1 rounded-full bg-black/60 border border-matrix-green-primary/30">
                                    zk-SNARKs
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="pointer-events-none absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden sm:block"
            >
                <div className="animate-bounce">
                    <svg
                        className="w-6 h-6 text-matrix-green-primary"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                </div>
            </motion.div>
        </section>
    );
}
