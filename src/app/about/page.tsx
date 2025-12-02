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
                <div className="container-max max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            <span className="glow-text">How Privora Works</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Privacy-first philanthropy powered by cutting-edge cryptography
                        </p>
                    </motion.div>

                    {/* Architecture Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-matrix-green-primary mb-6">
                            System Architecture
                        </h2>

                        <div className="space-y-6">
                            <div className="border-l-2 border-matrix-green-primary pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    1. Zcash Payment Layer
                                </h3>
                                <p className="text-gray-400">
                                    All donations flow through Zcash shielded addresses (Z-addresses), ensuring
                                    complete privacy for both sender and recipient. Transaction amounts and parties
                                    remain encrypted on-chain using zk-SNARKs.
                                </p>
                            </div>

                            <div className="border-l-2 border-matrix-green-primary pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    2. NEAR Coordination Layer
                                </h3>
                                <p className="text-gray-400">
                                    NEAR smart contracts handle donor intents, recipient attestations, and impact
                                    Soulbound Tokens (SBTs). No sensitive information is stored on-chain—only
                                    encrypted hashes and boolean flags.
                                </p>
                            </div>

                            <div className="border-l-2 border-matrix-green-primary pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    3. Zero-Knowledge Proofs
                                </h3>
                                <p className="text-gray-400">
                                    Recipients prove credentials (humanness, location, affiliations) without
                                    revealing their identity. Using Semaphore-style circuits, they can demonstrate
                                    &quot;I am a verified member of group X&quot; without revealing which member.
                                </p>
                            </div>

                            <div className="border-l-2 border-matrix-green-primary pl-6">
                                <h3 className="text-xl font-bold text-matrix-green-light mb-2">
                                    4. Off-Chain Matching Service
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
                        className="glass-card p-8 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-matrix-green-primary mb-6">
                            Privacy Guarantees
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-matrix-green-light mb-3">For Donors</h3>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-matrix-green-primary">→</span>
                                        <span>Donations are completely anonymous via Zcash shielded transactions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-matrix-green-primary">→</span>
                                        <span>No link between donor identity and recipient</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-matrix-green-primary">→</span>
                                        <span>Receive non-transferable SBT proving impact without revealing details</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-matrix-green-light mb-3">For Recipients</h3>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-matrix-green-primary">→</span>
                                        <span>Pseudonymous profiles with encrypted sensitive data</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-matrix-green-primary">→</span>
                                        <span>zk-proofs verify credentials without revealing identity</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-matrix-green-primary">→</span>
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
                        className="glass-card p-8"
                    >
                        <h2 className="text-2xl font-bold text-matrix-green-primary mb-6">
                            Use Cases
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
