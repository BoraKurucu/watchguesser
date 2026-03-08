"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
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
                    <h1 className="font-serif text-4xl font-bold text-[#1A1714] mb-8">Terms of Service</h1>

                    <div className="prose prose-slate prose-sm max-w-none text-[#3D3730] space-y-6 font-sans">
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing and playing WatchGuesser, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">2. User Conduct</h2>
                            <p>WatchGuesser is intended for personal, non-commercial use. Users agree not to attempt to manipulate the scores, bypass game limits, or use automated systems to interact with the game.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">3. Premium Subscriptions</h2>
                            <p>Premium features are provided on a subscription basis. All payments are final and non-refundable unless required by law. We reserve the right to modify or terminate premium features with reasonable notice.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">4. Intellectual Property</h2>
                            <p>The WatchGuesser name, logo, and game mechanics are the property of WatchGuesser. Watch images used in the game are for educational and entertainment purposes; trademarks and copyrights of the respective watch brands remain the property of their owners.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">5. Disclaimer of Warranties</h2>
                            <p className="uppercase text-[10px] font-bold leading-relaxed">
                                WATCHGUESSER IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">6. Limitation of Liability</h2>
                            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WATCHGUESSER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, RESULTING FROM YOUR ACCESS TO OR USE OF THE SERVICE.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">7. Indemnification</h2>
                            <p>You agree to indemnify and hold harmless WatchGuesser and its officers, directors, and employees from and against any claims, suits, proceedings, disputes, demands, liabilities, damages, losses, costs and expenses, including reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of our Service.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">8. Governing Law & Dispute Resolution</h2>
                            <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the Service operates, without regard to its conflict of law principles. Any dispute arising from these Terms shall be settled through binding arbitration in accordance with standard commercial arbitration rules.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1714] uppercase tracking-wider mb-3">9. Severability</h2>
                            <p>If any provision of these Terms is held to be invalid or unenforceable, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions of these Terms will remain in full force and effect.</p>
                        </section>

                        <p className="text-[#9C9189] italic pt-4">Last Updated: February 21, 2026</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
