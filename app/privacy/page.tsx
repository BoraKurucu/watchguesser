"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF8] py-12 px-6">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[#6B6259] hover:text-[#B8962E] text-sm font-sans font-semibold tracking-widest uppercase transition-colors mb-8"
                >
                    <ChevronLeft size={16} />
                    Back to Game
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#E0D9CC] rounded-sm p-8 md:p-12 shadow-sm"
                >
                    <h1 className="font-serif text-4xl font-bold text-[#1A1714] mb-8">Privacy Policy</h1>

                    <div className="prose prose-slate prose-sm max-w-none text-[#3D3730] space-y-6 font-sans">
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">1. Information We Collect</h2>
                            <p>We collect information you provide directly to us when you sign in via Google, including your name, email address, and profile picture. We also store your gameplay history and score data.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">2. How We Use Information</h2>
                            <p>We use your information to manage your account, track your high scores, provide a personalized "Watch Box" experience, and manage premium subscriptions.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">3. Data Storage and Security</h2>
                            <p>Your data is securely stored using Firebase (a Google platform). While we take reasonable measures to protect your information, no service is 100% secure.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">4. Third Parties</h2>
                            <p>We do not sell your personal data. We use Google for authentication and Firebase for data hosting. These providers have their own privacy policies.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">5. Cookies & Local Storage</h2>
                            <p>We use essential cookies and local storage to maintain session persistence and enforce gameplay limits. By using the app, you consent to the use of these necessary technologies.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">6. Your Rights (GDPR/CCPA)</h2>
                            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Right to Access:</strong> Request a copy of the data we hold about you.</li>
                                <li><strong>Right to Deletion:</strong> Request that we delete your account and associated data.</li>
                                <li><strong>Right to Rectification:</strong> Request corrections to inaccurate information.</li>
                                <li><strong>Right to Object:</strong> Object to our processing of your personal data.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">7. Data Retention</h2>
                            <p>We retain your information as long as your account is active or as needed to provide you the Service. If you wish to delete your account, please contact us or use the account management features if available.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">8. International Data Transfers</h2>
                            <p>Your data may be transferred to and maintained on servers located outside of your state or country, where data protection laws may differ from those in your jurisdiction. By using WatchGuesser, you consent to these transfers.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">9. Children's Privacy</h2>
                            <p>WatchGuesser is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">10. Contact Us</h2>
                            <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at support@watchguesser.web.app.</p>
                        </section>

                        <p className="text-[#9C9189] italic pt-4">Last Updated: February 21, 2026</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
