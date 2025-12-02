'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center section-padding">
            <div className="container-max">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="glow-text">Private</span>,{' '}
                            <span className="glow-text">Programmable</span>
                            <br />
                            <span className="text-white">Philanthropy</span>
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
                    >
                        Matching anonymous donors with verified-but-pseudonymous builders,
                        students, and activists using{' '}
                        <span className="text-matrix-green-primary font-semibold">
                            Zcash
                        </span>
                        ,{' '}
                        <span className="text-matrix-green-primary font-semibold">NEAR</span>
                        , and{' '}
                        <span className="text-matrix-green-primary font-semibold">
                            zk-proofs
                        </span>
                        .
                    </motion.p>

                    {/* Key Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="grid md:grid-cols-3 gap-6 mb-12"
                    >
                        {[
                            {
                                icon: '🔒',
                                title: 'Maximum Privacy',
                                desc: 'Shielded transactions via Zcash',
                            },
                            {
                                icon: '✨',
                                title: 'Verified Impact',
                                desc: 'zk-proofs for authentic recipients',
                            },
                            {
                                icon: '🌐',
                                title: 'Global Reach',
                                desc: 'Support builders anywhere, safely',
                            },
                        ].map((feature, idx) => (
                            <div key={idx} className="glass-card p-6 text-left">
                                <div className="text-4xl mb-3">{feature.icon}</div>
                                <h3 className="text-matrix-green-primary font-semibold text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/donor" className="w-full sm:w-auto">
                            <button className="btn-primary w-full sm:w-auto">
                                Start Giving
                            </button>
                        </Link>
                        <Link href="/recipient" className="w-full sm:w-auto">
                            <button className="btn-outline w-full sm:w-auto">
                                Apply as Recipient
                            </button>
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="mt-16 pt-8 border-t border-matrix-green-primary/20"
                    >
                        <p className="text-sm text-gray-500 mb-4">Powered by</p>
                        <div className="flex flex-wrap justify-center items-center gap-8">
                            {['Zcash', 'NEAR Protocol', 'zk-SNARKs'].map((tech, idx) => (
                                <div
                                    key={idx}
                                    className="font-mono text-matrix-green-primary/60 text-sm"
                                >
                                    {tech}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
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
