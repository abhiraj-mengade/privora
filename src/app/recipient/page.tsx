"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stripPII } from "@/lib/near-ai";
import { uploadToIPFS } from "@/lib/ipfs";
import { storePersona } from "@/lib/persona-store";
import { registerPersonaOnChain } from "@/lib/indexRegistry";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import {
  NetworkSchoolProof,
  verifyNetworkSchoolProof,
} from "@/lib/networkSchoolVerifier";

interface RecipientProfile {
  pseudonym: string;
  category: string;
  skills: string[];
  bio: string;
  fundingNeed: string;
  location: string;
  github?: string;
  portfolio?: string;
}

export default function RecipientPortal() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<RecipientProfile>({
    pseudonym: "",
    category: "",
    skills: [],
    bio: "",
    fundingNeed: "",
    location: "",
    github: "",
    portfolio: "",
  });

  const [zkProofs, setZkProofs] = useState({
    humanness: false,
    nsResident: false,
    location: false,
  });

  // Reclaim proofs (GitHub / Leetcode / Scholar / Location) and sanitized persona from NEAR AI
  const [githubProof, setGithubProof] = useState<any | null>(null);
  const [leetcodeProof, setLeetcodeProof] = useState<any | null>(null);
  const [scholarProof, setScholarProof] = useState<any | null>(null);
  const [locationProof, setLocationProof] = useState<any | null>(null);
  const [networkSchoolProof, setNetworkSchoolProof] =
    useState<NetworkSchoolProof | null>(null);
  const [sanitizedPersona, setSanitizedPersona] = useState<any | null>(null);
  const [zcashAddress, setZcashAddress] = useState<string>("");
  const [networkSchoolLoading, setNetworkSchoolLoading] = useState(false);
  const [networkSchoolError, setNetworkSchoolError] = useState<string | null>(
    null
  );
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [evmError, setEvmError] = useState<string | null>(null);

  const categoryOptions = [
    "Privacy Tools Developer",
    "ZK Research Student",
    "Human Rights Activist",
    "Infrastructure Builder",
    "Education Advocate",
    "Protocol Researcher",
  ];

  const skillOptions = [
    "Zcash",
    "Zero-Knowledge Proofs",
    "Rust",
    "Solidity",
    "Cryptography",
    "ZK-SNARKs",
    "Privacy Tech",
    "Smart Contracts",
    "Protocol Design",
    "Community Building",
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

  const startReclaimSession = async (
    providerId: string | undefined,
    setProof: (p: any) => void,
    label: string
  ) => {
    try {
      setError(null);
      const appId = process.env.NEXT_PUBLIC_RECLAIM_APP_ID;
      const appSecret = process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET;

      if (!appId || !appSecret) {
        throw new Error("Reclaim APP_ID/APP_SECRET not configured");
      }

      if (!providerId) {
        throw new Error(`Reclaim provider ID not configured for ${label}`);
      }

       // Initialize a proof request for this provider
      const reclaimClient = await ReclaimProofRequest.init(
        appId,
        appSecret,
        providerId,
        {
          log: true,
        }
      );

       // Get the URL where the user completes the verification.
       // On mobile, opening this URL will trigger the AppClip / Instant App path;
       // on desktop, it will show the Reclaim web flow (which can display a QR).
       const requestUrl = await reclaimClient.getRequestUrl();
       if (typeof window !== "undefined") {
         window.open(requestUrl, "_blank", "noopener,noreferrer");
       }

      // Start polling session status; onSuccess fires when proof is ready
      await reclaimClient.startSession({
        onSuccess: (proof) => {
          setProof(proof);
        },
        onError: (err) => {
          console.error(`${label} verification failed`, err);
          setError(`${label} verification failed`);
        },
      });
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : `Failed to start ${label} verification`
      );
    }
  };

  const handleVerifyGitHub = async () => {
    const providerId =
      process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_GITHUB_ID ||
      "8573efb4-4529-47d3-80da-eaa7384dac19";
    await startReclaimSession(providerId, setGithubProof, "GitHub");
  };

  const handleVerifyLeetcode = async () => {
    const providerId =
      process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_LEETCODE_ID ||
      "29162ff4-c52c-4275-829e-f8eaba1e7b99";
    await startReclaimSession(providerId, setLeetcodeProof, "Leetcode");
  };

  const handleVerifyScholar = async () => {
    const providerId =
      process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_SCHOLAR_ID ||
      "5f97d753-4bb6-484d-8686-72fc772272fa";
    await startReclaimSession(providerId, setScholarProof, "Google Scholar");
  };

  const handleVerifyLocation = async () => {
    const providerId =
      process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_LOCATION_ID ||
      "44fb27b2-64b9-48b4-a712-737194679158";
    await startReclaimSession(providerId, setLocationProof, "Location");
  };

  const handleVerifyNetworkSchool = async () => {
    try {
      setNetworkSchoolError(null);
      if (!evmAddress) {
        setNetworkSchoolError(
          "Connect an Ethereum wallet for Fhenix-based verification first."
        );
        return;
      }
      setNetworkSchoolError(null);
      setNetworkSchoolProof(null);
      setNetworkSchoolLoading(true);
      const proof = await verifyNetworkSchoolProof();
      setNetworkSchoolProof(proof);
      setZkProofs((prev) => ({ ...prev, nsResident: true }));
    } catch (e) {
      console.error("Network School verification failed:", e);
      setNetworkSchoolError(
        e instanceof Error ? e.message : "Network School verification failed"
      );
    } finally {
      setNetworkSchoolLoading(false);
    }
  };

  const handleConnectEvmWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setEvmError(
        "No Ethereum wallet found. Install MetaMask, Rabby, or Talisman and refresh."
      );
      return;
    }
    setEvmError(null);
    try {
      const eth = (window as any).ethereum;
      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || accounts.length === 0) {
        setEvmError(
          "No accounts returned from wallet. Create/import an account and try again."
        );
        return;
      }
      setEvmAddress(accounts[0]);
    } catch (err: any) {
      if (err?.code === 4001) {
        setEvmError("Wallet connection was rejected.");
        return;
      }
      setEvmError(
        err?.message || "Failed to connect Ethereum wallet. Please try again."
      );
    }
  };

  const handleSanitize = async () => {
    setProcessing(true);
    setError(null);
    try {
      const rawProfile = {
        pseudonym: profile.pseudonym,
        category: profile.category,
        skills: profile.skills,
        bio: profile.bio,
        fundingNeed: profile.fundingNeed,
        location: profile.location,
        github: profile.github || undefined,
        portfolio: profile.portfolio || undefined,
        verificationFlags: zkProofs,
      };
      const strippedProfile = await stripPII(rawProfile);
      setSanitizedPersona(strippedProfile);
    } catch (e) {
      console.error("Error sanitizing bio:", e);
      setError(e instanceof Error ? e.message : "Failed to sanitize bio");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitProofs = async () => {
    setProcessing(true);
    setError(null);

    try {
      if (!sanitizedPersona) {
        await handleSanitize();
      }

      // if (!sanitizedPersona) {
      //   throw new Error("Sanitized persona not available");
      // }

      // if (!zcashAddress.startsWith("zs1")) {
      //   throw new Error("Valid Zcash shielded address (zs1...) is required");
      // }

      // Compose final persona object that donors will download from IPFS
      const finalProfile = {
        persona: sanitizedPersona,
        proofs: {
          github: githubProof,
          leetcode: leetcodeProof,
          scholar: scholarProof,
          location: locationProof,
          networkSchool: networkSchoolProof,
        },
        paymentAddress: zcashAddress,
      };

      const ipfsResult = await uploadToIPFS(finalProfile);

      // Local demo index (per‑browser)
      storePersona(ipfsResult.ipfsHash, ipfsResult.ipfsUrl);

      // On‑chain global index (Sepolia) – best‑effort, non‑blocking
      try {
        await registerPersonaOnChain(ipfsResult.ipfsHash);
      } catch (chainErr) {
        console.warn("Failed to register persona on‑chain index:", chainErr);
      }

      setIpfsHash(ipfsResult.ipfsHash);
      setIpfsUrl(ipfsResult.ipfsUrl);
      setStep(3);
    } catch (err) {
      console.error("Error processing profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process profile"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="relative min-h-screen">
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
              <span className="glow-text">Recipient portal</span>{" "}
              <span className="text-white/90">for pseudonymous builders.</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
              Publish an encrypted, non-doxxing profile; attach zk-proofs for
              credibility; let donors discover you without ever learning your
              real-world identity.
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <div className="flex justify-center items-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s === step
                      ? "bg-gradient-matrix text-black"
                      : s < step
                      ? "bg-matrix-green-dark text-black"
                      : "bg-matrix-green-subtle text-matrix-green-primary border border-matrix-green-primary/30"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      s < step
                        ? "bg-matrix-green-primary"
                        : "bg-matrix-green-primary/20"
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
                All information is encrypted and pseudonymous—describe your
                work, not your passport.
              </p>

              {/* Pseudonym */}
              <div className="mb-6">
                <label className="block text-matrix-green-primary font-semibold mb-3">
                  Choose a pseudonym
                </label>
                <input
                  type="text"
                  value={profile.pseudonym}
                  onChange={(e) =>
                    setProfile({ ...profile, pseudonym: e.target.value })
                  }
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
                  onChange={(e) =>
                    setProfile({ ...profile, category: e.target.value })
                  }
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
                      className={`px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                        profile.skills.includes(skill)
                          ? "bg-gradient-matrix text-black"
                          : "bg-matrix-green-subtle text-matrix-green-primary border border-matrix-green-primary/30"
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
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Describe your work and goals without revealing personal information..."
                  className="input-field min-h-32 resize-none"
                />
              </div>

                {/* Funding need */}
                <div className="mb-6">
                  <label className="block text-matrix-green-primary font-semibold mb-3">
                    What do you need funding for?
                  </label>
                  <textarea
                    value={profile.fundingNeed}
                    onChange={(e) =>
                      setProfile({ ...profile, fundingNeed: e.target.value })
                    }
                    placeholder="Explain the project, milestone, or expense the ZEC will support..."
                    className="input-field min-h-28 resize-none"
                  />
                </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-matrix-green-primary font-semibold mb-3">
                  Location (coarse)
                </label>
                <select
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select location</option>
                  <option value="Global">Global</option>
                  <option value="High-Risk Region">High-Risk Region</option>
                  <option value="Academic Institution">
                    Academic Institution
                  </option>
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
                  onChange={(e) =>
                    setProfile({ ...profile, github: e.target.value })
                  }
                  placeholder="github.com/username"
                  className="input-field"
                />
              </div>

              <div className="mb-6">
                <label className="block text-matrix-green-primary font-semibold mb-3">
                  Portfolio (optional)
                </label>
                <input
                  type="text"
                  value={profile.portfolio}
                  onChange={(e) =>
                    setProfile({ ...profile, portfolio: e.target.value })
                  }
                  placeholder="https://your-portfolio.com"
                  className="input-field"
                />
              </div>

              {/* Zcash shielded address */}
              <div className="mb-8">
                <label className="block text-matrix-green-primary font-semibold mb-3">
                  Zcash shielded address
                </label>
                <input
                  type="text"
                  value={zcashAddress}
                  onChange={(e) => setZcashAddress(e.target.value.trim())}
                  placeholder="zs1..."
                  className="input-field font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This address receives shielded ZEC from donors. Keep it
                  private and safe.
                </p>
              </div>

              <button
                onClick={handleSubmitProfile}
                disabled={
                  !profile.pseudonym ||
                  !profile.category ||
                  profile.skills.length === 0 ||
                  !profile.bio ||
                  !profile.fundingNeed ||
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
                Optional zk-proofs & sanitize bio
              </h2>
              <p className="text-gray-400 mb-8 text-xs md:text-sm">
                Optionally add zk-proofs for humanness, activity, or location
                without revealing your identity. Then send your bio through the
                Data Incinerator (NEAR AI TEE) before publishing.
              </p>

              {/* EVM wallet connect for Fhenix verification */}
              <div className="mb-4 border border-matrix-green-primary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-matrix-green-primary">
                      Connect Ethereum wallet (Sepolia)
                    </h3>
                    <p className="text-xs text-gray-400">
                      Required once for Fhenix-based Network School verification.
                    </p>
                  </div>
                  {evmAddress && (
                    <span className="text-[10px] text-matrix-green-primary font-mono">
                      {evmAddress.slice(0, 6)}…{evmAddress.slice(-4)}
                    </span>
                  )}
                </div>
                {evmError && (
                  <p className="text-[11px] text-red-400 mb-2">{evmError}</p>
                )}
                <button
                  onClick={handleConnectEvmWallet}
                  className="btn-outline text-xs w-full"
                >
                  {evmAddress ? "Reconnect Ethereum wallet" : "Connect Ethereum wallet"}
                </button>
              </div>

              <div className="space-y-6">
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
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        zkProofs.nsResident
                          ? "bg-matrix-green-primary border-matrix-green-primary"
                          : "border-matrix-green-primary/50"
                      }`}
                    >
                      {zkProofs.nsResident && (
                        <span className="text-black text-sm">✓</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyNetworkSchool}
                    disabled={networkSchoolLoading}
                    className="btn-outline text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {networkSchoolLoading
                      ? "Verifying..."
                      : zkProofs.nsResident
                      ? "Network School Verified ✓"
                      : "Verify via Network School"}
                  </button>
                  {networkSchoolError && (
                    <p className="text-xs text-red-400 mt-2">{networkSchoolError}</p>
                  )}
                  {networkSchoolProof && (
                    <p className="text-[11px] text-gray-500 mt-2 break-all">
                      Proof tx: {networkSchoolProof.txHash}
                    </p>
                  )}
                </div>

                {/* Other startup society proofs (coming soon) */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border border-matrix-green-primary/20 rounded-lg p-4 opacity-60">
                    <h4 className="text-sm font-semibold text-matrix-green-primary mb-1">
                      YC / YC School
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      Prove YC affiliation without revealing your batch.
                    </p>
                    <button
                      disabled
                      className="btn-outline text-xs w-full disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Proof coming soon
                    </button>
                  </div>
                  <div className="border border-matrix-green-primary/20 rounded-lg p-4 opacity-60">
                    <h4 className="text-sm font-semibold text-matrix-green-primary mb-1">
                      Antler Founder
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      ZK-proof of Antler residency without doxxing your cohort.
                    </p>
                    <button
                      disabled
                      className="btn-outline text-xs w-full disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Proof coming soon
                    </button>
                  </div>
                  <div className="border border-matrix-green-primary/20 rounded-lg p-4 opacity-60">
                    <h4 className="text-sm font-semibold text-matrix-green-primary mb-1">
                      The Residency
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      ZK attestation of Residency participation.
                    </p>
                    <button
                      disabled
                      className="btn-outline text-xs w-full disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Proof coming soon
                    </button>
                  </div>
                </div>

                {/* Location Proof */}
                <div className="border border-matrix-green-primary/30 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-matrix-green-primary mb-2">
                        Location Proof (Optional)
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Coarse location proof without revealing exact
                        coordinates
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        zkProofs.location
                          ? "bg-matrix-green-primary border-matrix-green-primary"
                          : "border-matrix-green-primary/50"
                      }`}
                    >
                      {zkProofs.location && (
                        <span className="text-black text-sm">✓</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setZkProofs({ ...zkProofs, location: true });
                      void handleVerifyLocation();
                    }}
                    className="btn-outline text-sm w-full"
                  >
                    {zkProofs.location
                      ? "Location Verified ✓"
                      : "Verify Location via Reclaim"}
                  </button>
                </div>
              </div>

              {/* Reclaim GitHub proof */}
              <div className="border border-matrix-green-primary/30 rounded-lg p-6 mt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-matrix-green-primary mb-2">
                      GitHub contributor proof
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Use Reclaim to prove ownership and activity of a GitHub
                      account without revealing the handle.
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      githubProof
                        ? "bg-matrix-green-primary border-matrix-green-primary"
                        : "border-matrix-green-primary/50"
                    }`}
                  >
                    {githubProof && (
                      <span className="text-black text-sm">✓</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleVerifyGitHub}
                  className="btn-outline text-sm w-full"
                >
                  {githubProof
                    ? "GitHub Verified ✓"
                    : "Verify GitHub via Reclaim"}
                </button>
              </div>

              {/* Reclaim Leetcode proof */}
              <div className="border border-matrix-green-primary/30 rounded-lg p-6 mt-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-matrix-green-primary mb-2">
                      Leetcode proof
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Prove your problem-solving activity on Leetcode without
                      revealing your username.
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      leetcodeProof
                        ? "bg-matrix-green-primary border-matrix-green-primary"
                        : "border-matrix-green-primary/50"
                    }`}
                  >
                    {leetcodeProof && (
                      <span className="text-black text-sm">✓</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleVerifyLeetcode}
                  className="btn-outline text-sm w-full"
                >
                  {leetcodeProof
                    ? "Leetcode Verified ✓"
                    : "Verify Leetcode via Reclaim"}
                </button>
              </div>

              {/* Reclaim Google Scholar proof */}
              <div className="border border-matrix-green-primary/30 rounded-lg p-6 mt-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-matrix-green-primary mb-2">
                      Google Scholar proof
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Prove citations / publications via Google Scholar in
                      zero-knowledge.
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      scholarProof
                        ? "bg-matrix-green-primary border-matrix-green-primary"
                        : "border-matrix-green-primary/50"
                    }`}
                  >
                    {scholarProof && (
                      <span className="text-black text-sm">✓</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleVerifyScholar}
                  className="btn-outline text-sm w-full"
                >
                  {scholarProof
                    ? "Scholar Verified ✓"
                    : "Verify Scholar via Reclaim"}
                </button>
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
                  disabled={processing}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span>
                      Processing...
                    </span>
                  ) : (
                    "Complete Registration"
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
                Your profile has been processed through the Data Incinerator
                (NEAR AI TEE), stripped of all PII, and published to IPFS.
                Donors can now discover you through the matching service.
              </p>

              {ipfsHash && (
                <div className="bg-black/50 border border-matrix-green-primary/30 rounded-lg p-6 mb-8">
                  <h3 className="font-bold text-matrix-green-primary mb-4">
                    Your Anonymous Persona
                  </h3>
                  <div className="space-y-2 text-left">
                    <p className="text-gray-300">
                      <span className="text-matrix-green-primary font-mono">
                        IPFS Hash:
                      </span>{" "}
                      <span className="font-mono text-xs break-all">
                        {ipfsHash}
                      </span>
                    </p>
                    {ipfsUrl && (
                      <p className="text-gray-300">
                        <span className="text-matrix-green-primary">
                          IPFS URL:
                        </span>{" "}
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
                      <span className="text-matrix-green-primary">
                        Pseudonym:
                      </span>{" "}
                      {profile.pseudonym}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-matrix-green-primary">
                        Category:
                      </span>{" "}
                      {profile.category}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-matrix-green-primary">Skills:</span>{" "}
                      {profile.skills.join(", ")}
                    </p>
                          <p className="text-gray-300">
                            <span className="text-matrix-green-primary">
                              Funding need:
                            </span>{" "}
                            {profile.fundingNeed}
                          </p>
                    <p className="text-gray-300">
                      <span className="text-matrix-green-primary">
                        Verifications:
                      </span>{" "}
                      {Object.values(zkProofs).filter(Boolean).length} proofs
                      submitted
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
