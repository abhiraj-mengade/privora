'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import MatrixRain from '@/components/MatrixRain';

interface DonorPreferences {
    topics: string[];
    geography: string;
    amount: string;
    recurring: boolean;
}

export default function DonorPortal() {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState<DonorPreferences>({
        topics: [],
        geography: 'global',
        amount: '',
        recurring: false,
    });

    const [matches, setMatches] = useState([
        {
            id: 1,
            pseudonym: 'Builder_0x7f3a',
            category: 'Privacy Tools Developer',
            location: 'Global',
            skills: ['Zcash', 'Zero-Knowledge Proofs', 'Rust'],
            bio: 'Building privacy-preserving infrastructure for the next generation of decentralized applications.',
            verified: true,
            nsResident: true,
        },
        {
            id: 2,
            pseudonym: 'Activist_0x2b9c',
            category: 'Human Rights Advocate',
            location: 'High-Risk Region',
            skills: ['Privacy Tech', 'Community Organizing', 'Education'],
            bio: 'Working to protect digital rights and privacy in authoritarian regions.',
            verified: true,
            nsResident: false,
        },
        {
            id: 3,
            pseudonym: 'Scholar_0x4e1d',
            category: 'Privacy Research Student',
            location: 'Academic Institution',
            skills: ['Cryptography', 'ZK-SNARKs', 'Protocol Design'],
            bio: 'Researching scalable zero-knowledge proof systems for real-world applications.',
            verified: true,
            nsResident: true,
        },
    ]);

    const topicOptions = [
        'Zero-Knowledge Proofs',
        'Privacy Technology',
        'DeFi Tooling',
        'Human Rights',
        'Education',
        'Infrastructure',
        'Research',
    ];

    const toggleTopic = (topic: string) => {
        setPreferences((prev) => ({
            ...prev,
            topics: prev.topics.includes(topic)
                ? prev.topics.filter((t) => t !== topic)
                : [...prev.topics, topic],
        }));
    };

    const handleFindMatches = () => {
        setStep(2);
    };

    return (
        <main className="relative min-h-screen">
            <MatrixRain />
            <div className="matrix-bg" />
            <Navbar />

            <div className="pt-32 pb-20 section-padding">
                <div className="container-max max-w-6xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <p className="text-xs uppercase tracking-[0.3em] text-matrix-green-primary/70 mb-3">
                            INTERFACE · DONORS
                        </p>
                        <h1 className="text-3xl md:text-5xl font-semibold md:font-bold mb-4">
                            <span className="glow-text">Donor portal</span>{' '}
                            <span className="text-white/90">for anonymous capital.</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                            Express where you want your ZEC to land without ever putting your identity
                            on-chain. Privora handles matching, proofs, and shielded settlement.
                        </p>
                    </motion.div>

                    {step === 1 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-7 md:p-10 max-w-3xl mx-auto border border-matrix-green-primary/30"
                        >
                            <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary mb-2">
                                Set your preferences
                            </h2>
                            <p className="text-gray-400 text-xs md:text-sm mb-8">
                                These sliders and tags never hit a public chain—only encrypted signals feed the matcher.
                            </p>

                            {/* Topics */}
                            <div className="mb-8">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Topics of interest
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                    {topicOptions.map((topic) => (
                                        <button
                                            key={topic}
                                            onClick={() => toggleTopic(topic)}
                                            className={`px-3.5 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${preferences.topics.includes(topic)
                                                    ? 'bg-gradient-matrix text-black'
                                                    : 'bg-matrix-green-subtle text-matrix-green-primary border border-matrix-green-primary/30'
                                                }`}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Geography */}
                            <div className="mb-8">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Geographic focus
                                </label>
                                <select
                                    value={preferences.geography}
                                    onChange={(e) =>
                                        setPreferences({ ...preferences, geography: e.target.value })
                                    }
                                    className="input-field"
                                >
                                    <option value="global">Global (Any Location)</option>
                                    <option value="restricted">High-Risk Regions Only</option>
                                    <option value="academic">Academic Institutions</option>
                                    <option value="network-school">Network School Residents</option>
                                </select>
                            </div>

                            {/* Funding Amount */}
                            <div className="mb-8">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Funding amount (ZEC)
                                </label>
                                <input
                                    type="number"
                                    value={preferences.amount}
                                    onChange={(e) =>
                                        setPreferences({ ...preferences, amount: e.target.value })
                                    }
                                    placeholder="Enter amount in ZEC"
                                    className="input-field"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {/* Recurring */}
                            <div className="mb-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.recurring}
                                        onChange={(e) =>
                                            setPreferences({ ...preferences, recurring: e.target.checked })
                                        }
                                        className="w-5 h-5 accent-matrix-green-primary"
                                    />
                                    <span className="text-gray-300">Make this a recurring donation</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleFindMatches}
                                disabled={preferences.topics.length === 0 || !preferences.amount}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Find Matched Recipients
                            </button>
                        </motion.div>
                    ) : (
                        /* Step 2: Matched Recipients */
                        <div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-8 flex justify-between items-center"
                            >
                                <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary">
                                    Matched recipients ({matches.length})
                                </h2>
                                <button onClick={() => setStep(1)} className="btn-outline">
                                    ← Adjust Preferences
                                </button>
                            </motion.div>

                            <div className="grid gap-6">
                                {matches.map((match, idx) => (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass-card p-6 hover:scale-[1.01] transition-transform border border-matrix-green-primary/25"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-xl font-bold font-mono text-matrix-green-primary">
                                                        {match.pseudonym}
                                                    </h3>
                                                    {match.verified && (
                                                        <span className="px-2 py-1 bg-matrix-green-subtle text-matrix-green-primary text-xs rounded-full border border-matrix-green-primary/30">
                                                            Verified
                                                        </span>
                                                    )}
                                                    {match.nsResident && (
                                                        <span className="px-2 py-1 bg-matrix-green-subtle text-matrix-green-primary text-xs rounded-full border border-matrix-green-primary/30 font-mono">
                                                            NS
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-400 mb-3">{match.bio}</p>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {match.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="px-3 py-1 bg-black/50 text-matrix-green-primary text-xs rounded-full border border-matrix-green-primary/20"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>📍 {match.location}</span>
                                                    <span>🏷️ {match.category}</span>
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-3">
                                                <button className="btn-primary text-sm px-6">
                                                    Send Donation
                                                </button>
                                                <button className="btn-outline text-sm px-6">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
