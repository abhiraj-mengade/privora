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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingDonation, setSendingDonation] = useState<string | null>(null);
  const [donorZAddress, setDonorZAddress] = useState<string | null>(null);
  const [quoteResults, setQuoteResults] = useState<
    Record<string, ZcashTransactionResult>
  >({});

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
    </main>
  );
}
