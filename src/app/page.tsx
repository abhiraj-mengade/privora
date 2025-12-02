import MatrixRain from '@/components/MatrixRain';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Matrix Background */}
      <MatrixRain />

      {/* Gradient Background */}
      <div className="matrix-bg" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <section className="section-padding relative">
        <div className="container-max">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="glow-text">How It Works</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Donors */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-matrix flex items-center justify-center text-black font-bold text-xl">
                  1
                </div>
                <h3 className="text-2xl font-bold text-matrix-green-primary">
                  For Donors
                </h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Specify your preferences (topics, geography, funding amount)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Review matched opportunities with pseudonymous profiles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Send ZEC to shielded addresses for maximum privacy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Receive a Soulbound Token (SBT) on NEAR as proof of impact</span>
                </li>
              </ul>
            </div>

            {/* For Recipients */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-matrix flex items-center justify-center text-black font-bold text-xl">
                  2
                </div>
                <h3 className="text-2xl font-bold text-matrix-green-primary">
                  For Recipients
                </h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Create a privacy-preserving profile with skills and interests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Submit zk-proofs for verification (humanness, credentials)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Get matched with donors based on encrypted attributes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-matrix-green-primary mt-1">→</span>
                  <span>Receive funding privately via Zcash shielded transfers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Technology Section */}
      <section className="section-padding relative bg-black/40">
        <div className="container-max">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
            <span className="glow-text">Privacy-First Technology</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Built on battle-tested privacy primitives to ensure both donors and recipients remain anonymous
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Zcash Shielded Transactions',
                description: 'All payments flow through shielded Z-addresses, ensuring transaction amounts and parties remain completely private on-chain.',
                tech: 'zk-SNARKs',
              },
              {
                title: 'NEAR Smart Contracts',
                description: 'Coordination layer for donor intents, impact SBTs, and recipient attestations without revealing sensitive information.',
                tech: 'Rust + WASM',
              },
              {
                title: 'Zero-Knowledge Proofs',
                description: 'Recipients prove credentials (humanness, location, affiliations) without revealing their actual identity.',
                tech: 'Semaphore',
              },
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6">
                <div className="inline-block px-3 py-1 bg-matrix-green-subtle rounded-full text-xs font-mono text-matrix-green-primary mb-4">
                  {item.tech}
                </div>
                <h3 className="text-xl font-bold text-matrix-green-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-matrix-green-primary/20 py-12">
        <div className="container-max px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-gray-500">
              © 2024 Privora. Private philanthropy for the modern age.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-matrix-green-primary hover:text-matrix-green-light transition-colors text-sm">
                Documentation
              </a>
              <a href="#" className="text-matrix-green-primary hover:text-matrix-green-light transition-colors text-sm">
                GitHub
              </a>
              <a href="#" className="text-matrix-green-primary hover:text-matrix-green-light transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
