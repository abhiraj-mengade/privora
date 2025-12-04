import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <section className="section-padding relative">
        <div className="container-max">
          <div className="max-w-5xl mx-auto mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-matrix-green-primary/70 mb-3">
              FLOW
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold md:font-bold mb-4">
              <span className="glow-text">Two interfaces,</span>{" "}
              <span className="text-white/90">one private graph.</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              Patrons express intent. Builders prove credibility. Privora
              stitches encrypted signals into matches without exposing either
              side to the public ledger.
            </p>
          </div>

          <div className="grid gap-6 lg:gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
            {/* For Patrons */}
            <div className="glass-card p-6 md:p-7 lg:p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-matrix opacity-10 blur-3xl" />
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-matrix flex items-center justify-center text-black font-bold text-lg md:text-xl shadow-[0_0_0_1px_rgba(0,255,65,0.4)]">
                    01
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-semibold text-matrix-green-primary">
                      For patrons
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      Intent → Match → Shielded settlement
                    </p>
                  </div>
                </div>
                <span className="hidden md:inline-flex items-center rounded-full border border-matrix-green-primary/30 px-3 py-1 text-[11px] font-mono text-matrix-green-primary/70">
                  anon source
                </span>
              </div>
              <ul className="space-y-3 text-gray-300 text-sm md:text-[15px]">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Specify topics, geography and funding amount in a private
                    preference UI.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Browse pseudonymous, verified recipients—no names, just
                    proofs and work.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Send ZEC to shielded addresses so amounts and counterparties
                    never go public.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Receive a non-transferable SBT on NEAR as proof of impact,
                    not clout.
                  </span>
                </li>
              </ul>
            </div>

            {/* For Builders */}
            <div className="glass-card p-6 md:p-7 lg:p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-matrix opacity-10 blur-3xl" />
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/70 border border-matrix-green-primary/40 flex items-center justify-center text-matrix-green-primary font-bold text-lg md:text-xl shadow-[0_0_0_1px_rgba(0,255,65,0.3)]">
                    02
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-semibold text-matrix-green-primary">
                      For builders
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      zk-credentials → encrypted profile
                    </p>
                  </div>
                </div>
                <span className="hidden md:inline-flex items-center rounded-full border border-matrix-green-primary/30 px-3 py-1 text-[11px] font-mono text-matrix-green-primary/70">
                  pseudonymous sink
                </span>
              </div>
              <ul className="space-y-3 text-gray-300 text-sm md:text-[15px]">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Create an encrypted profile with skills, focus areas, and
                    coarse geography.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Attach zk-proofs for humanness, affiliations, or
                    residency—no identity leakage.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Get matched against donor intents via encrypted attribute
                    graphs.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-[1px] bg-matrix-green-primary/70" />
                  <span>
                    Receive funds through Zcash shielded transfers, not doxxable
                    bank rails.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Technology Section */}
      <section className="section-padding relative bg-black/40">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-matrix-green-primary/70 mb-3">
              STACK
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold md:font-bold mb-4">
              <span className="glow-text">Privacy-first primitives,</span>{" "}
              <span className="text-white/90">composed for philanthropy.</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              Each layer handles exactly one job—payments, coordination,
              proofs—so we can reason about guarantees without hand-waving.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Zcash shielded payments",
                description:
                  "Donations flow through Z-addresses (shielded addresses). Transaction amounts, senders, and recipients remain encrypted on-chain using zk-SNARKs. Only the parties involved can decrypt their own transactions.",
                tech: "zk-SNARKs",
              },
              {
                title: "Ethereum Sepolia coordination",
                description:
                  "Smart contracts on Sepolia handle IPFS persona indexing and FHE-enabled impact SBTs. Only IPFS hashes, funding counts, and encrypted amounts are stored on-chain—never raw profiles or payment details.",
                tech: "Solidity · FHE",
              },
              {
                title: "FHE-enabled verification",
                description:
                  "Builders prove Network School residency and other credentials using FHE (Fully Homomorphic Encryption) on Fhenix. Verification status is encrypted and only decryptable by the claimant via CoFHE.",
                tech: "FHE · CoFHE",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-5 md:p-6 lg:p-7 flex flex-col justify-between border border-matrix-green-primary/30"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-matrix-green-subtle rounded-full text-[11px] font-mono text-matrix-green-primary mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-matrix-green-primary animate-pulse" />
                    {item.tech}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-matrix-green-primary mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-matrix-green-primary/15 text-[11px] text-gray-500 font-mono flex items-center justify-between">
                  <span>Deterministic guarantees</span>
                  <span className="text-matrix-green-primary/70">
                    no manual screening
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
