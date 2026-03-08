"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signInWithGoogle } from "@/lib/auth";
import { Check } from "lucide-react";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  async function handleGoogleSignIn() {
    if (!accepted) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(msg.includes("popup-closed") ? null : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-sm mx-auto px-4 text-center"
    >
      {/* Gold rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-px mb-10 origin-left"
        style={{ background: "linear-gradient(to right, transparent, #B8962E, transparent)" }}
      />

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h1 className="font-serif text-6xl font-bold text-[#1A1714] leading-none mb-1">Watch</h1>
        <h1 className="font-serif text-6xl italic font-bold text-[#B8962E] leading-none">Guesser</h1>
        <p className="text-[#6B6259] text-sm font-sans font-semibold mt-4 tracking-widest uppercase">
          A horology knowledge game
        </p>
      </motion.div>

      {/* Sign-in card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-sm overflow-hidden mb-4"
        style={{ border: "1px solid #E0D9CC", background: "#FFFFFF", boxShadow: "0 2px 16px rgba(26,23,20,0.06)" }}
      >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #EDE9E0", background: "#FAFAF8" }}>
          <p className="text-xs text-[#B8962E] uppercase tracking-widest font-sans font-bold">
            Sign in to track your scores
          </p>
        </div>
        <div className="px-6 py-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !accepted}
            className="
              w-full flex items-center justify-center gap-3
              px-5 py-3.5
              bg-white border border-[#E0D9CC]
              hover:border-[#B8962E]/50 hover:bg-[#FAFAF8]
              rounded-sm transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              group
            "
            style={{ boxShadow: "0 1px 4px rgba(26,23,20,0.06)" }}
          >
            {loading ? (
              <div
                className="w-4 h-4 rounded-full animate-spin"
                style={{ border: "2px solid #E0D9CC", borderTopColor: "#B8962E" }}
              />
            ) : (
              <GoogleIcon />
            )}
            <span className="text-[#1A1714] text-base font-sans font-semibold tracking-wide">
              {loading ? "Signing in…" : "Continue with Google"}
            </span>
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#9B2335] text-xs font-sans mt-3 text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Consent Checkbox */}
          <div className="mt-6 flex items-start gap-3 text-left">
            <button
              onClick={() => setAccepted(!accepted)}
              className={`
                mt-0.5 w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center shrink-0
                ${accepted ? "bg-[#B8962E] border-[#B8962E]" : "bg-white border-[#E0D9CC]"}
              `}
            >
              {accepted && <Check size={12} className="text-white" />}
            </button>
            <p className="text-[#6B6259] text-[11px] leading-relaxed font-sans">
              I agree to the{" "}
              <Link href="/terms" className="text-[#B8962E] hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[#B8962E] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Guest play option — prominent CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <button
          onClick={() => {
            document.dispatchEvent(new CustomEvent("watchguesser:guest"));
          }}
          className="w-full py-3.5 rounded-sm font-sans font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:bg-[#A07828] active:scale-[0.99]"
          style={{ background: "#B8962E", color: "#FFFFFF" }}
        >
          Play Free — No Sign In
        </button>
        <p className="text-[#9C9189] text-xs font-sans text-center">
          Sign in only needed to save scores &amp; unlock premium
        </p>
      </motion.div>

      {/* Bottom rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
        className="h-px mt-10 origin-right"
        style={{ background: "linear-gradient(to left, transparent, #B8962E, transparent)" }}
      />
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
