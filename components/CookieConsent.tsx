"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if consent has already been given
        const consent = localStorage.getItem("google-consent-mode");
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleConsent = (granted: boolean) => {
        const consentState = granted ? "granted" : "denied";

        // Update Google Tag Manager consent state
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("consent", "update", {
                ad_storage: consentState,
                ad_user_data: consentState,
                ad_personalization: consentState,
                analytics_storage: consentState,
            });
        }

        localStorage.setItem("google-consent-mode", consentState);
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-[100] max-w-lg mx-auto"
                >
                    <div className="bg-white/95 backdrop-blur-md border border-[#E0D9CC] shadow-2xl rounded-lg p-5 md:p-6 flex flex-col md:flex-row items-center gap-4">
                        <div className="bg-[#F5EDD0] p-3 rounded-full shrink-0">
                            <ShieldCheck className="text-[#B8962E]" size={24} />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-[#1A1714] font-serif font-bold text-lg mb-1">Privacy & Preferences</h3>
                            <p className="text-[#6B6259] text-xs font-sans leading-relaxed">
                                We use cookies to enhance your experience and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies for ads personalization and measurement.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => handleConsent(false)}
                                className="px-4 py-2 text-[#9C9189] hover:text-[#1A1714] text-xs font-sans font-bold tracking-widest uppercase transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleConsent(true)}
                                className="px-6 py-2.5 bg-[#B8962E] text-white text-xs font-sans font-bold tracking-widest uppercase rounded-sm shadow-sm hover:bg-[#A07828] active:scale-[0.98] transition-all"
                            >
                                Accept All
                            </button>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-3 right-3 text-[#C8BFB5] hover:text-[#1A1714] transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
