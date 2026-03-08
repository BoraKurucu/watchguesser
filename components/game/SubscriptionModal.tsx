"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Lock, Globe, Diamond, Settings, Archive, DollarSign, Star } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth";
import { useState } from "react";
import Link from "next/link";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  gamesRemaining?: number;
  userEmail?: string | null;
}

const PREMIUM_FEATURES = [
  { icon: Globe, text: "Unlimited daily games" },
  { icon: Diamond, text: "Premium modes" },
  { icon: Archive, text: "Price Guesser" },
  { icon: Star, text: "Watch Box Collection (Gold pieces)" },
  { icon: Archive, text: "Deep post-game spec sheets" },
  { icon: Check, text: "Ad-free, immersive experience" },
];

const GUMROAD_URL =
  process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ??
  "https://gumroad.com/l/watchguesser-premium";

export default function SubscriptionModal({
  open,
  onClose,
  onUpgrade,
  gamesRemaining,
  userEmail,
}: SubscriptionModalProps) {
  const isSignedIn = Boolean(userEmail);
  const [accepted, setAccepted] = useState(false);

  async function handleSignInFirst() {
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // ignore
    }
  }

  function handleCheckout() {
    const url = new URL(GUMROAD_URL);
    url.searchParams.set("wanted", "true");
    url.searchParams.set("t", Date.now().toString());
    window.open(url.toString(), "_blank", "noopener,noreferrer");
    onUpgrade();
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(26,23,20,0.5)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="w-full max-w-sm rounded-sm overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #E0D9CC", boxShadow: "0 8px 40px rgba(26,23,20,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="relative px-5 py-4"
              style={{ background: "#FAFAF8", borderBottom: "1px solid #EDE9E0" }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-[#C8BFB5] hover:text-[#6B6259] transition-colors"
              >
                <X size={16} />
              </button>

              {isSignedIn ? (
                <>
                  <p className="text-[10px] text-[#B8962E]/70 uppercase tracking-[0.3em] font-sans mb-1 font-bold">
                    Premium Access
                  </p>
                  <h2 className="font-serif text-2xl text-[#1A1714]">
                    Join the Club
                  </h2>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-[#B8962E]/70 uppercase tracking-[0.3em] font-sans mb-1 font-bold">
                    Sign In Required
                  </p>
                  <h2 className="font-serif text-2xl text-[#1A1714]">
                    Sign in to continue
                  </h2>
                </>
              )}
            </div>

            <div className="px-5 py-5">
              {isSignedIn ? (
                <>
                  <div className="mb-4">
                    <div className="space-y-2.5">
                      {PREMIUM_FEATURES.map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}
                          >
                            <Icon size={8} className="text-[#B8962E]" />
                          </div>
                          <span className="text-[#1A1714] text-xs font-sans font-medium">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-sm mb-4"
                    style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}
                  >
                    <div>
                      <span className="font-serif text-2xl text-[#B8962E]">$3.99</span>
                      <span className="text-[#6B6259] text-[10px] font-sans ml-1 uppercase tracking-wider font-bold">/ Mo</span>
                    </div>
                    <div className="text-[#1A6B3A] text-xs font-sans uppercase font-extrabold tracking-tight mt-1">Cancel anytime, no commitment</div>
                  </div>
                </>
              ) : (
                <div
                  className="px-4 py-3 rounded-sm mb-4"
                  style={{ background: "#FAFAF8", border: "1px solid #E0D9CC" }}
                >
                  <p className="text-[#1A1714] text-sm font-sans font-bold">Sign in to see Premium options</p>
                  <p className="text-[#9C9189] text-xs font-sans mt-1">
                    Create an account to view pricing and start competing in Premium tournaments.
                  </p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={isSignedIn ? handleCheckout : handleSignInFirst}
                disabled={!isSignedIn && !accepted}
                className="
                  w-full py-3.5 bg-[#B8962E] text-white
                  font-sans font-bold text-sm tracking-widest uppercase
                  rounded-sm hover:bg-[#A07828] active:scale-[0.99]
                  transition-all duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {isSignedIn ? "Unlock Everything" : "Sign In to Join Premium"}
              </button>

              {!isSignedIn && (
                <div className="mt-3 flex items-start gap-3 text-left">
                  <button
                    onClick={() => setAccepted(!accepted)}
                    className={`
                      mt-0.5 w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center shrink-0
                      ${accepted ? "bg-[#B8962E] border-[#B8962E]" : "bg-white border-[#E0D9CC]"}
                    `}
                  >
                    {accepted && <Check size={12} className="text-white" />}
                  </button>
                  <p className="text-[#6B6259] text-[11px] leading-relaxed font-sans font-medium">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#B8962E] hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-[#B8962E] hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              )}

              <p className="text-center text-[#C8BFB5] text-[9px] font-sans mt-3 font-medium uppercase tracking-widest">
                Secure & encrypted payment
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
