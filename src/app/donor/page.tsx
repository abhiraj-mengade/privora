"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MatrixRain from "@/components/MatrixRain";
import { findMatchingPersonas, type MatchedPersona } from "@/lib/near-ai";
import { retrieveFromIPFS } from "@/lib/ipfs";
import { getStoredPersonas } from "@/lib/persona-store";
import {
  sendShieldedTransaction,
  getRecipientShieldedAddress,
  generateShieldedAddress,
  formatZEC,
  checkQuoteStatus,
  type ZcashTransactionResult,
} from "@/lib/zcash";
import { issueImpactSBT } from "@/lib/sbt";

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
    geography: "global",
    amount: "",
    recurring: false,
  });

  const [matches, setMatches] = useState<MatchedPersona[]>([]);
  const [allProfiles, setAllProfiles] = useState<
    Array<{ ipfsHash: string; profile: any }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingDonation, setSendingDonation] = useState<string | null>(null);
  const [donorZAddress, setDonorZAddress] = useState<string | null>(null);
  const [quoteResults, setQuoteResults] = useState<
    Record<string, ZcashTransactionResult>
  >({});

  // Direct funding modal state (from "Browse all recipients" section)
  const [directOpen, setDirectOpen] = useState(false);
  const [directProfile, setDirectProfile] = useState<{
    ipfsHash: string;
    profile: any;
  } | null>(null);
  const [directAmount, setDirectAmount] = useState("");
  const [directReason, setDirectReason] = useState("");
  const [directError, setDirectError] = useState<string | null>(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directTxId, setDirectTxId] = useState<string | null>(null);
  const [directSbtId, setDirectSbtId] = useState<string | null>(null);

  const topicOptions = [
    "Zero-Knowledge Proofs",
    "Privacy Technology",
    "DeFi Tooling",
    "Human Rights",
    "Education",
    "Infrastructure",
    "Research",
  ];

  const toggleTopic = (topic: string) => {
    setPreferences((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  // Generate donor's shielded address on mount (optional, for refunds)
  useEffect(() => {
    generateShieldedAddress().then(setDonorZAddress).catch(console.error);
  }, []);

  // Load all recipient personas on mount for browsing
  useEffect(() => {
    const loadAllProfiles = async () => {
      try {
        const storedPersonas = getStoredPersonas();
        if (!storedPersonas.length) return;

        const personasWithData = await Promise.all(
          storedPersonas.map(async (stored) => {
            try {
              const profile = await retrieveFromIPFS(stored.ipfsHash);
              return {
                ipfsHash: stored.ipfsHash,
                profile: profile as any,
              };
            } catch (err) {
              console.error(`Failed to load persona ${stored.ipfsHash}:`, err);
              return null;
            }
          })
        );

        const valid = personasWithData.filter(
          (p) => p !== null
        ) as Array<{ ipfsHash: string; profile: any }>;
        setAllProfiles(valid);
      } catch (err) {
        console.error("Error loading all profiles:", err);
      }
    };

    void loadAllProfiles();
  }, []);

  // Mock client-side shielded Zcash tx (replace with real WASM wallet later)
  const sendDirectShieldedMock = async (
    address: string,
    amountZec: number,
    memo?: string
  ) => {
    console.log("Direct Zcash send (mock)", { address, amountZec, memo });
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const openDirectModal = (entry: { ipfsHash: string; profile: any }) => {
    setDirectProfile(entry);
    setDirectAmount("");
    setDirectReason("");
    setDirectError(null);
    setDirectTxId(null);
    setDirectSbtId(null);
    setDirectOpen(true);
  };

  const handleConfirmDirectFunding = async () => {
    if (!directProfile) return;
    setDirectLoading(true);
    setDirectError(null);
    setDirectTxId(null);
    try {
      const amount = parseFloat(directAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Enter a valid amount in ZEC");
      }

      const recipientAddress: string | undefined =
        directProfile.profile.paymentAddress;
      if (!recipientAddress || !recipientAddress.startsWith("zs1")) {
        throw new Error("Recipient does not have a valid Zcash shielded address");
      }

      const txId = await sendDirectShieldedMock(
        recipientAddress,
        amount,
        directReason
          ? `Privora direct grant: ${directReason}`
          : "Privora direct grant"
      );
      setDirectTxId(txId);
      try {
        const sbt = await issueImpactSBT({
          donorAddress: donorZAddress,
          recipientPseudonym:
            directProfile.profile?.persona?.pseudonym ?? "recipient",
          amountZec: amount,
          txId,
          memo: directReason,
        });
        setDirectSbtId(sbt.tokenId);
      } catch (err) {
        console.error("Failed to mint SBT for direct donation:", err);
      }
    } catch (err) {
      console.error("Error sending direct donation:", err);
      setDirectError(
        err instanceof Error ? err.message : "Failed to send direct donation"
      );
    } finally {
      setDirectLoading(false);
    }
  };

  const handleFindMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Load all available personas from storage
      const storedPersonas = getStoredPersonas();

      if (storedPersonas.length === 0) {
        setError(
          "No recipients available yet. Please wait for recipients to register."
        );
        setLoading(false);
        return;
      }

      // Step 2: Retrieve persona data from IPFS
      const personasWithData = await Promise.all(
        storedPersonas.map(async (stored) => {
          try {
            const profile = await retrieveFromIPFS(stored.ipfsHash);
            return {
              ipfsHash: stored.ipfsHash,
              profile: profile as any,
            };
          } catch (err) {
            console.error(`Failed to load persona ${stored.ipfsHash}:`, err);
            return null;
          }
        })
      );

      const validPersonas = personasWithData.filter(
        (p) => p !== null
      ) as Array<{
        ipfsHash: string;
        profile: any;
      }>;

      if (validPersonas.length === 0) {
        setError("Failed to load recipient profiles. Please try again later.");
        setLoading(false);
        return;
      }

      // Step 3: Use AI to find matches (Agentic Wallet)
      const matched = await findMatchingPersonas(preferences, validPersonas);

      setMatches(matched);
      setStep(2);
    } catch (err) {
      console.error("Error finding matches:", err);
      setError(err instanceof Error ? err.message : "Failed to find matches");
    } finally {
      setLoading(false);
    }
  };

  const handleSendDonation = async (match: MatchedPersona) => {
    setSendingDonation(match.ipfsHash);
    setError(null);

    try {
      // Get recipient's shielded address
      const recipientZAddress = await getRecipientShieldedAddress(
        match.ipfsHash
      );

      // Get quote from NEAR Intents 1Click API
      const amount = parseFloat(preferences.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid donation amount");
      }

      const result = await sendShieldedTransaction({
        toAddress: recipientZAddress,
        amount,
        memo: `Donation to ${match.pseudonym} via Privora`,
        refundTo: donorZAddress || undefined,
      });

      // Store quote result to show deposit address
      setQuoteResults((prev) => ({
        ...prev,
        [match.ipfsHash]: result,
      }));
    } catch (err) {
      console.error("Error getting donation quote:", err);
      setError(
        err instanceof Error ? err.message : "Failed to get donation quote"
      );
      setSendingDonation(null);
    }
  };

  const handleCheckQuoteStatus = async (match: MatchedPersona) => {
    const quote = quoteResults[match.ipfsHash];
    if (!quote) return;

    try {
      const status = await checkQuoteStatus(quote.quoteId);

      setQuoteResults((prev) => ({
        ...prev,
        [match.ipfsHash]: status,
      }));

      if (status.status === "fulfilled") {
        alert(
          `Donation completed successfully!\n\nTransaction ID: ${
            status.txId
          }\nAmount: ${formatZEC(parseFloat(preferences.amount))}\nRecipient: ${
            match.pseudonym
          }\n\nYour donation has been processed on the Zcash network.`
        );
        try {
          const amountZec = parseFloat(preferences.amount);
          if (!isNaN(amountZec) && status.txId) {
            await issueImpactSBT({
              donorAddress: donorZAddress,
              recipientPseudonym: match.pseudonym,
              amountZec,
              txId: status.txId,
              memo: match.matchReason,
            });
          }
        } catch (err) {
          console.error("Failed to issue impact SBT:", err);
        }
        // Remove quote from display
        setQuoteResults((prev) => {
          const updated = { ...prev };
          delete updated[match.ipfsHash];
          return updated;
        });
        setSendingDonation(null);
      }
    } catch (err) {
      console.error("Error checking quote status:", err);
      setError(err instanceof Error ? err.message : "Failed to check status");
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
              INTERFACE · DONORS
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold md:font-bold mb-4">
              <span className="glow-text">Donor portal</span>{" "}
              <span className="text-white/90">for anonymous capital.</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
              Express where you want your ZEC to land without ever putting your
              identity on-chain. Privora handles matching, proofs, and shielded
              settlement.
            </p>
          </motion.div>

          {step === 1 ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              {/* AI intent panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-7 md:p-10 border border-matrix-green-primary/30"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-matrix-green-primary mb-2">
                  Set your preferences
                </h2>
                <p className="text-gray-400 text-xs md:text-sm mb-8">
                  These sliders and tags never hit a public chain—only encrypted
                  signals feed the matcher.
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
                        className={`px-3.5 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                          preferences.topics.includes(topic)
                            ? "bg-gradient-matrix text-black"
                            : "bg-matrix-green-subtle text-matrix-green-primary border border-matrix-green-primary/30"
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
                      setPreferences({
                        ...preferences,
                        geography: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="global">Global (Any Location)</option>
                    <option value="restricted">High-Risk Regions Only</option>
                    <option value="academic">Academic Institutions</option>
                    <option value="network-school">
                      Network School Residents
                    </option>
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
                      setPreferences({
                        ...preferences,
                        amount: e.target.value,
                      })
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
                        setPreferences({
                          ...preferences,
                          recurring: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-matrix-green-primary"
                    />
                    <span className="text-gray-300">
                      Make this a recurring donation
                    </span>
                  </label>
                </div>

                {/* Submit */}
                {error && (
                  <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleFindMatches}
                  disabled={
                    preferences.topics.length === 0 ||
                    !preferences.amount ||
                    loading
                  }
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⟳</span>
                      Finding matches with AI...
                    </span>
                  ) : (
                    "Find Matched Recipients"
                  )}
                </button>
              </motion.div>

              {/* Browse all recipients */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card p-6 md:p-7 border border-matrix-green-primary/20 max-h-[560px] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-semibold text-matrix-green-primary">
                    Browse all recipients
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    {allProfiles.length} profiles
                  </span>
                </div>
                {allProfiles.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No recipient personas published yet. Ask builders to
                    complete the recipient flow.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {allProfiles.map((entry) => {
                      const { ipfsHash, profile } = entry;
                      const persona = profile.persona ?? {};
                      const skills: string[] = persona.skills ?? [];
                      const proofs = profile.proofs ?? {};
                      return (
                        <div
                          key={ipfsHash}
                          className="border border-matrix-green-primary/25 rounded-lg p-4 text-left"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-mono text-sm text-matrix-green-primary">
                                {persona.pseudonym ?? "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {persona.category ?? "Uncategorized"}
                              </p>
                            </div>
                            <span className="text-[10px] text-gray-500 break-all max-w-[120px]">
                              {ipfsHash}
                            </span>
                          </div>
                          {/* ZK verification badges from Reclaim proofs */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {proofs.github && (
                              <span className="px-2 py-0.5 rounded-full border border-matrix-green-primary/40 text-[10px] text-matrix-green-primary bg-matrix-green-subtle/20">
                                GitHub zk-verified
                              </span>
                            )}
                            {proofs.leetcode && (
                              <span className="px-2 py-0.5 rounded-full border border-matrix-green-primary/40 text-[10px] text-matrix-green-primary bg-matrix-green-subtle/20">
                                Leetcode zk-verified
                              </span>
                            )}
                            {proofs.scholar && (
                              <span className="px-2 py-0.5 rounded-full border border-matrix-green-primary/40 text-[10px] text-matrix-green-primary bg-matrix-green-subtle/20">
                                Scholar zk-verified
                              </span>
                            )}
                            {proofs.location && (
                              <span className="px-2 py-0.5 rounded-full border border-matrix-green-primary/40 text-[10px] text-matrix-green-primary bg-matrix-green-subtle/20">
                                Location zk-verified
                              </span>
                            )}
                            {!proofs.github &&
                              !proofs.leetcode &&
                              !proofs.scholar &&
                              !proofs.location && (
                                <span className="text-[10px] text-gray-500">
                                  No zk-proofs attached yet
                                </span>
                              )}
                          </div>
                          {persona.bio && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-3">
                              {persona.bio}
                            </p>
                          )}
                          {persona.fundingNeed && (
                            <p className="text-[11px] text-gray-400 mb-2 line-clamp-2">
                              <span className="text-matrix-green-primary">
                                Funding need:
                              </span>{" "}
                              {persona.fundingNeed}
                            </p>
                          )}
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {skills.slice(0, 4).map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 border border-matrix-green-primary/30 rounded-full text-[10px] text-matrix-green-primary"
                                >
                                  {s}
                                </span>
                              ))}
                              {skills.length > 4 && (
                                <span className="text-[10px] text-gray-500">
                                  +{skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => openDirectModal(entry)}
                              className="btn-outline text-xs px-4 py-1.5"
                            >
                              Fund directly
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
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

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {matches.length === 0 && !loading && (
                <div className="glass-card p-8 text-center border border-matrix-green-primary/30">
                  <p className="text-gray-400">
                    No matches found. Try adjusting your preferences.
                  </p>
                </div>
              )}

              <div className="grid gap-6">
                {matches.map((match, idx) => (
                  <motion.div
                    key={match.ipfsHash}
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
                          {match.verificationFlags.humanness && (
                            <span className="px-2 py-1 bg-matrix-green-subtle text-matrix-green-primary text-xs rounded-full border border-matrix-green-primary/30">
                              Verified
                            </span>
                          )}
                          {match.verificationFlags.nsResident && (
                            <span className="px-2 py-1 bg-matrix-green-subtle text-matrix-green-primary text-xs rounded-full border border-matrix-green-primary/30 font-mono">
                              NS
                            </span>
                          )}
                          <span className="px-2 py-1 bg-matrix-green-subtle text-matrix-green-primary text-xs rounded-full border border-matrix-green-primary/30">
                            {match.matchScore}% match
                          </span>
                        </div>

                        <p className="text-gray-400 mb-2 text-sm italic">
                          {match.matchReason}
                        </p>

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
                        {match.fundingNeed && (
                          <p className="text-xs text-gray-400 mb-3">
                            <span className="text-matrix-green-primary">
                              Funding need:
                            </span>{" "}
                            {match.fundingNeed}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📍 {match.location}</span>
                          <span>🏷️ {match.category}</span>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-3">
                        {quoteResults[match.ipfsHash] ? (
                          <div className="space-y-3">
                            <div className="glass-card p-4 border border-matrix-green-primary/30">
                              <h4 className="text-sm font-bold text-matrix-green-primary mb-2">
                                Send ZEC to Deposit Address
                              </h4>
                              <p className="text-xs text-gray-400 mb-3">
                                Send {formatZEC(parseFloat(preferences.amount))}{" "}
                                to the address below. NEAR Intents will complete
                                the transaction to {match.pseudonym}.
                              </p>
                              <div className="bg-black/50 p-3 rounded border border-matrix-green-primary/20 mb-3">
                                <p className="text-xs text-gray-500 mb-1">
                                  Deposit Address:
                                </p>
                                <p className="text-matrix-green-primary font-mono text-xs break-all">
                                  {quoteResults[match.ipfsHash].depositAddress}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      quoteResults[match.ipfsHash]
                                        .depositAddress
                                    );
                                    alert(
                                      "Deposit address copied to clipboard!"
                                    );
                                  }}
                                  className="btn-outline text-xs px-4 py-2 flex-1"
                                >
                                  Copy Address
                                </button>
                                <button
                                  onClick={() => handleCheckQuoteStatus(match)}
                                  className="btn-primary text-xs px-4 py-2 flex-1"
                                >
                                  Check Status
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  setQuoteResults((prev) => {
                                    const updated = { ...prev };
                                    delete updated[match.ipfsHash];
                                    return updated;
                                  });
                                  setSendingDonation(null);
                                }}
                                className="btn-outline text-xs w-full mt-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSendDonation(match)}
                              disabled={sendingDonation === match.ipfsHash}
                              className="btn-primary text-sm px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {sendingDonation === match.ipfsHash ? (
                                <span className="flex items-center gap-2">
                                  <span className="animate-spin">⟳</span>
                                  Getting quote...
                                </span>
                              ) : (
                                `Send ${formatZEC(
                                  parseFloat(preferences.amount)
                                )}`
                              )}
                            </button>
                            <button className="btn-outline text-sm px-6">
                              View Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Direct funding modal */}
      {directOpen && directProfile && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="glass-card max-w-md w-full mx-4 p-6 border border-matrix-green-primary/40">
            <h3 className="text-lg font-semibold text-matrix-green-primary mb-2">
              Fund{" "}
              {directProfile.profile?.persona?.pseudonym ?? "recipient"} directly
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              This sends ZEC to the recipient&apos;s shielded address from your Zcash
              wallet (mocked for now). In production, this will be wired to a
              local WASM wallet (e.g. zingolib).
            </p>
            <div className="mb-4">
              <label className="block text-matrix-green-primary font-semibold mb-1 text-sm">
                Amount (ZEC)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
                className="input-field"
                placeholder="e.g. 5"
              />
            </div>
            <div className="mb-4">
              <label className="block text-matrix-green-primary font-semibold mb-1 text-sm">
                Reason (optional)
              </label>
              <textarea
                value={directReason}
                onChange={(e) => setDirectReason(e.target.value)}
                className="input-field min-h-20"
                placeholder="Why you are funding this recipient..."
              />
            </div>
            {directError && (
              <div className="mb-3 p-3 rounded border border-red-500/40 bg-red-900/20 text-xs text-red-300">
                {directError}
              </div>
            )}
            {directTxId && (
              <div className="mb-3 p-3 rounded border border-matrix-green-primary/40 bg-black/40 text-xs text-matrix-green-primary">
                <p className="font-mono break-all">TxID: {directTxId}</p>
              </div>
            )}
            {directSbtId && (
              <div className="mb-3 p-3 rounded border border-matrix-green-primary/40 bg-black/30 text-[11px] text-matrix-green-primary">
                Impact badge issued: {directSbtId}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setDirectOpen(false);
                  setDirectProfile(null);
                  setDirectError(null);
                  setDirectTxId(null);
                  setDirectSbtId(null);
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDirectFunding}
                disabled={directLoading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {directLoading ? "Sending..." : "Send ZEC"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
