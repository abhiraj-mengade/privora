'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import MatrixRain from '@/components/MatrixRain';
import { stripPII } from '@/lib/near-ai';
import { uploadToIPFS } from '@/lib/ipfs';
import { storePersona } from '@/lib/persona-store';

interface RecipientProfile {
    pseudonym: string;
    category: string;
    skills: string[];
    bio: string;
    location: string;
    github?: string;
    portfolio?: string;
}

export default function RecipientPortal() {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<RecipientProfile>({
        pseudonym: '',
        category: '',
        skills: [],
        bio: '',
        location: '',
        github: '',
        portfolio: '',
    });

    const [zkProofs, setZkProofs] = useState({
        humanness: false,
        nsResident: false,
        location: false,
    });

    const categoryOptions = [
        'Privacy Tools Developer',
        'ZK Research Student',
        'Human Rights Activist',
        'Infrastructure Builder',
        'Education Advocate',
        'Protocol Researcher',
    ];

    const skillOptions = [
        'Zcash',
        'Zero-Knowledge Proofs',
        'Rust',
        'Solidity',
        'Cryptography',
        'ZK-SNARKs',
        'Privacy Tech',
        'Smart Contracts',
        'Protocol Design',
        'Community Building',
    ];

    const toggleSkill = (skill: string) => {
        setProfile((prev) => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter((s) => s !== skill)
                : [...prev.skills, skill],
        }));
    };

    const handleSubmitProfile = () => {
        setStep(2);
    };

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ipfsHash, setIpfsHash] = useState<string | null>(null);
    const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);

    const handleSubmitProofs = async () => {
        setProcessing(true);
        setError(null);

        try {
            // Step 1: Strip PII using NEAR AI Cloud (Data Incinerator)
            const rawProfile = {
                pseudonym: profile.pseudonym,
                category: profile.category,
                skills: profile.skills,
                bio: profile.bio,
                location: profile.location,
                github: profile.github || undefined,
                portfolio: profile.portfolio || undefined,
                verificationFlags: zkProofs,
            };

            const strippedProfile = await stripPII(rawProfile);

            // Step 2: Upload to IPFS
            const ipfsResult = await uploadToIPFS(strippedProfile);

            // Step 3: Store locally
            storePersona(ipfsResult.ipfsHash, ipfsResult.ipfsUrl);

            setIpfsHash(ipfsResult.ipfsHash);
            setIpfsUrl(ipfsResult.ipfsUrl);
            setStep(3);
        } catch (err) {
            console.error('Error processing profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to process profile');
        } finally {
            setProcessing(false);
        }
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
                            INTERFACE · RECIPIENTS
                        </p>
                        <h1 className="text-3xl md:text-5xl font-semibold md:font-bold mb-4">
                            <span className="glow-text">Recipient portal</span>{' '}
                            <span className="text-white/90">for pseudonymous builders.</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                            Publish an encrypted, non-doxxing profile; attach zk-proofs for credibility; let donors
                            discover you without ever learning your real-world identity.
                        </p>
                    </motion.div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center items-center gap-4 mb-12">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s === step
                                            ? 'bg-gradient-matrix text-black'
                                            : s < step
                                                ? 'bg-matrix-green-dark text-black'
                                                : 'bg-matrix-green-subtle text-matrix-green-primary border border-matrix-green-primary/30'
                                        }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`w-16 h-1 ${s < step ? 'bg-matrix-green-primary' : 'bg-matrix-green-primary/20'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-7 md:p-10 max-w-3xl mx-auto border border-matrix-green-primary/30"
                        >
                            <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary mb-2">
                                Create your profile
                            </h2>
                            <p className="text-gray-400 mb-8 text-xs md:text-sm">
                                All information is encrypted and pseudonymous—describe your work, not your passport.
                            </p>

                            {/* Pseudonym */}
                            <div className="mb-6">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Choose a pseudonym
                                </label>
                                <input
                                    type="text"
                                    value={profile.pseudonym}
                                    onChange={(e) => setProfile({ ...profile, pseudonym: e.target.value })}
                                    placeholder="e.g., Builder_0x7f3a"
                                    className="input-field font-mono"
                                />
                            </div>

                            {/* Category */}
                            <div className="mb-6">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Category
                                </label>
                                <select
                                    value={profile.category}
                                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select a category</option>
                                    {categoryOptions.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Skills & interests
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {skillOptions.map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkill(skill)}
                                            className={`px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${profile.skills.includes(skill)
                                                    ? 'bg-gradient-matrix text-black'
                                                    : 'bg-matrix-green-subtle text-matrix-green-primary border border-matrix-green-primary/30'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Bio (non-identifying)
                                </label>
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Describe your work and goals without revealing personal information..."
                                    className="input-field min-h-32 resize-none"
                                />
                            </div>

                            {/* Location */}
                            <div className="mb-6">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Location (coarse)
                                </label>
                                <select
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select location</option>
                                    <option value="Global">Global</option>
                                    <option value="High-Risk Region">High-Risk Region</option>
                                    <option value="Academic Institution">Academic Institution</option>
                                    <option value="Tech Hub">Tech Hub</option>
                                </select>
                            </div>

                            {/* Optional Links */}
                            <div className="mb-6">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    GitHub (optional)
                                </label>
                                <input
                                    type="text"
                                    value={profile.github}
                                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                                    placeholder="github.com/username"
                                    className="input-field"
                                />
                            </div>

                            <div className="mb-8">
                                <label className="block text-matrix-green-primary font-semibold mb-3">
                                    Portfolio (optional)
                                </label>
                                <input
                                    type="text"
                                    value={profile.portfolio}
                                    onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                                    placeholder="https://your-portfolio.com"
                                    className="input-field"
                                />
                            </div>

                            <button
                                onClick={handleSubmitProfile}
                                disabled={
                                    !profile.pseudonym ||
                                    !profile.category ||
                                    profile.skills.length === 0 ||
                                    !profile.bio ||
                                    !profile.location
                                }
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Verification
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-7 md:p-10 max-w-3xl mx-auto border border-matrix-green-primary/30"
                        >
                            <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary mb-2">
                                Submit zk-proofs
                            </h2>
                            <p className="text-gray-400 mb-8 text-xs md:text-sm">
                                Verify your credentials without revealing your identity—proofs of membership, not KYC.
                            </p>

                            <div className="space-y-6">
                                {/* Proof of Humanness */}
                                <div className="border border-matrix-green-primary/30 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-matrix-green-primary mb-2">
                                                Proof of Humanness
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                Verify you&apos;re a unique human using zk-proofs
                                            </p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${zkProofs.humanness
                                                    ? 'bg-matrix-green-primary border-matrix-green-primary'
                                                    : 'border-matrix-green-primary/50'
                                                }`}
                                        >
                                            {zkProofs.humanness && <span className="text-black text-sm">✓</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setZkProofs({ ...zkProofs, humanness: true })}
                                        className="btn-outline text-sm w-full"
                                    >
                                        {zkProofs.humanness ? 'Verified ✓' : 'Verify with zk-Passport'}
                                    </button>
                                </div>

                                {/* Network School Resident */}
                                <div className="border border-matrix-green-primary/30 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-matrix-green-primary mb-2">
                                                Network School Resident (Optional)
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                Prove NS participation without revealing which cohort
                                            </p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${zkProofs.nsResident
                                                    ? 'bg-matrix-green-primary border-matrix-green-primary'
                                                    : 'border-matrix-green-primary/50'
                                                }`}
                                        >
                                            {zkProofs.nsResident && <span className="text-black text-sm">✓</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setZkProofs({ ...zkProofs, nsResident: true })}
                                        className="btn-outline text-sm w-full"
                                    >
                                        {zkProofs.nsResident ? 'Verified ✓' : 'Verify NS Residency'}
                                    </button>
                                </div>

                                {/* Location Proof */}
                                <div className="border border-matrix-green-primary/30 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-matrix-green-primary mb-2">
                                                Location Proof (Optional)
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                Coarse location proof without revealing exact coordinates
                                            </p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${zkProofs.location
                                                    ? 'bg-matrix-green-primary border-matrix-green-primary'
                                                    : 'border-matrix-green-primary/50'
                                                }`}
                                        >
                                            {zkProofs.location && <span className="text-black text-sm">✓</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setZkProofs({ ...zkProofs, location: true })}
                                        className="btn-outline text-sm w-full"
                                    >
                                        {zkProofs.location ? 'Verified ✓' : 'Verify Location'}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={processing}
                                    className="btn-outline flex-1 disabled:opacity-50"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSubmitProofs}
                                    disabled={!zkProofs.humanness || processing}
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin">⟳</span>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Complete Registration'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        /* Step 3: Success */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 max-w-2xl mx-auto text-center"
                        >
                            <div className="w-20 h-20 bg-gradient-matrix rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">✓</span>
                            </div>
                            <h2 className="text-3xl font-bold text-matrix-green-primary mb-4">
                                Profile Published Successfully!
                            </h2>
                            <p className="text-gray-400 mb-8">
                                Your profile has been processed through the Data Incinerator (NEAR AI TEE), stripped of
                                all PII, and published to IPFS. Donors can now discover you through the matching
                                service.
                            </p>

                            {ipfsHash && (
                                <div className="bg-black/50 border border-matrix-green-primary/30 rounded-lg p-6 mb-8">
                                    <h3 className="font-bold text-matrix-green-primary mb-4">Your Anonymous Persona</h3>
                                    <div className="space-y-2 text-left">
                                        <p className="text-gray-300">
                                            <span className="text-matrix-green-primary font-mono">IPFS Hash:</span>{' '}
                                            <span className="font-mono text-xs break-all">{ipfsHash}</span>
                                        </p>
                                        {ipfsUrl && (
                                            <p className="text-gray-300">
                                                <span className="text-matrix-green-primary">IPFS URL:</span>{' '}
                                                <a
                                                    href={ipfsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-matrix-green-primary hover:underline break-all text-xs"
                                                >
                                                    {ipfsUrl}
                                                </a>
                                            </p>
                                        )}
                                        <p className="text-gray-300">
                                            <span className="text-matrix-green-primary">Pseudonym:</span>{' '}
                                            {profile.pseudonym}
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="text-matrix-green-primary">Category:</span> {profile.category}
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="text-matrix-green-primary">Skills:</span>{' '}
                                            {profile.skills.join(', ')}
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="text-matrix-green-primary">Verifications:</span>{' '}
                                            {Object.values(zkProofs).filter(Boolean).length} proofs submitted
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => setStep(1)} className="btn-primary">
                                Create Another Profile
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
