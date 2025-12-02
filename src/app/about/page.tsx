import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import MatrixRain from '@/components/MatrixRain';

export default function AboutPage() {
    return (
        <main className="relative min-h-screen">
            <MatrixRain />
            <div className="matrix-bg" />
            <Navbar />

            <div className="pt-32 pb-20 section-padding">
                <div className="container-max max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-14 md:mb-16"
                    >
                        <p className="text-xs uppercase tracking-[0.3em] text-matrix-green-primary/70 mb-3">
                            ARCHITECTURE
                        </p>
                        <h1 className="text-3xl md:text-5xl font-semibold md:font-bold mb-4">
                            <span className="glow-text">How Privora works</span>{' '}
                            <span className="text-white/90">under the hood.</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                            We separate money flow, coordination, and identity into distinct layers,
                            each with its own threat model and guarantees.
                        </p>
                    </motion.div>

                    {/* Architecture Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-7 md:p-8 mb-8 border border-matrix-green-primary/30"
                    >
                        <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary mb-6 flex items-center gap-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-matrix-green-primary/40 text-xs font-mono">
                                L1
                            </span>
                            System architecture
                        </h2>

                        <div className="space-y-6">
                            <div className="border-l-[1.5px] border-matrix-green-primary/60 pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    1 · Zcash payment layer
                                </h3>
                                <p className="text-gray-400">
                                    All donations flow through Zcash shielded addresses (Z-addresses), ensuring
                                    complete privacy for both sender and recipient. Transaction amounts and parties
                                    remain encrypted on-chain using zk-SNARKs.
                                </p>
                            </div>

                            <div className="border-l-[1.5px] border-matrix-green-primary/60 pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    2 · NEAR coordination layer
                                </h3>
                                <p className="text-gray-400">
                                    NEAR smart contracts handle donor intents, recipient attestations, and impact
                                    Soulbound Tokens (SBTs). No sensitive information is stored on-chain—only
                                    encrypted hashes and boolean flags.
                                </p>
                            </div>

                            <div className="border-l-[1.5px] border-matrix-green-primary/60 pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    3 · Zero-knowledge proofs
                                </h3>
                                <p className="text-gray-400">
                                    Recipients prove credentials (humanness, location, affiliations) without
                                    revealing their identity. Using Semaphore-style circuits, they can demonstrate
                                    &quot;I am a verified member of group X&quot; without revealing which member.
                                </p>
                            </div>

                            <div className="border-l-[1.5px] border-matrix-green-primary/60 pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    4 · Off-chain matching service
                                </h3>
                                <p className="text-gray-400">
                                    Encrypted profiles are stored off-chain with searchable attributes (skills,
                                    topics, coarse location). Matching uses tag intersection without accessing raw
                                    identity data.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Privacy Guarantees */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-7 md:p-8 mb-8 border border-matrix-green-primary/30"
                    >
                        <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary mb-6 flex items-center gap-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-matrix-green-primary/40 text-xs font-mono">
                                L2
                            </span>
                            Privacy guarantees
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-matrix-green-light mb-3">For Donors</h3>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-4 w-[1px] bg-matrix-green-primary/80" />
                                        <span>Donations are completely anonymous via Zcash shielded transactions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-4 w-[1px] bg-matrix-green-primary/80" />
                                        <span>No link between donor identity and recipient</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-4 w-[1px] bg-matrix-green-primary/80" />
                                        <span>Receive non-transferable SBT proving impact without revealing details</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-matrix-green-light mb-3">For Recipients</h3>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-4 w-[1px] bg-matrix-green-primary/80" />
                                        <span>Pseudonymous profiles with encrypted sensitive data</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-4 w-[1px] bg-matrix-green-primary/80" />
                                        <span>zk-proofs verify credentials without revealing identity</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-4 w-[1px] bg-matrix-green-primary/80" />
                                        <span>Receive funds safely via shielded addresses</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Use Cases */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card p-7 md:p-8 border border-matrix-green-primary/30"
                    >
                        <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary mb-6 flex items-center gap-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-matrix-green-primary/40 text-xs font-mono">
                                L3
                            </span>
                            Use cases
                        </h2>

                        <div className="space-y-4">
                            {[
                                {
                                    title: 'Network School Scholarships',
                                    desc: 'Anonymous donors fund verified NS participants without knowing their identity',
                                },
                                {
                                    title: 'High-Risk Region Support',
                                    desc: 'Support activists and builders in authoritarian regions with complete privacy',
                                },
                                {
                                    title: 'Privacy Tech Development',
                                    desc: 'Fund open-source privacy tools and infrastructure development',
                                },
                                {
                                    title: 'Research Grants',
                                    desc: 'Support academic research in cryptography and zero-knowledge proofs',
                                },
                            ].map((useCase, idx) => (
                                <div
                                    key={idx}
                                    className="bg-black/30 border border-matrix-green-primary/20 rounded-lg p-4"
                                >
                                    <h3 className="font-bold text-matrix-green-light mb-2">{useCase.title}</h3>
                                    <p className="text-gray-400 text-sm">{useCase.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
