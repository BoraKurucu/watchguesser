import { motion, AnimatePresence } from "framer-motion";
import { X, Diamond, Info, Droplets, Settings, Calendar, Hash } from "lucide-react";
import Image from "next/image";
import { Watch } from "@/lib/types";
import { getWatchImagePath } from "@/lib/assets";

interface SpecSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    watch: Watch;
}

export default function SpecSheetModal({ isOpen, onClose, watch }: SpecSheetModalProps) {
    if (!isOpen || !watch) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1714]/90 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-sm shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9CC] bg-[#FAFAF8]">
                        <div className="flex items-center gap-2">
                            <Diamond size={16} className="text-[#B8962E]" />
                            <h2 className="text-[#1A1714] font-sans font-bold tracking-widest uppercase text-xs">Premium Deep Dive</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-[#9C9189] hover:text-[#1A1714] transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Watch Header */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 relative bg-[#F5F3EE] rounded-sm p-2 flex-shrink-0">
                                <Image
                                    src={getWatchImagePath(watch.image_name)}
                                    alt={watch.name}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif font-bold text-[#1A1714] mb-1">{watch.brand}</h3>
                                <p className="text-[#6B6259] font-sans text-sm">{watch.name}</p>
                                {watch.price && (
                                    <p className="inline-block mt-2 px-2 py-1 bg-[#F5EDD0] text-[#B8962E] font-mono font-bold text-xs rounded-sm">
                                        Est. {watch.price}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Spec Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#FAFAF8] rounded-sm border border-[#E0D9CC]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Hash size={14} className="text-[#9C9189]" />
                                    <span className="text-[10px] font-bold text-[#9C9189] uppercase tracking-widest">Reference</span>
                                </div>
                                <p className="font-mono text-sm text-[#1A1714]">{watch.reference || "Unknown"}</p>
                            </div>

                            <div className="p-4 bg-[#FAFAF8] rounded-sm border border-[#E0D9CC]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings size={14} className="text-[#9C9189]" />
                                    <span className="text-[10px] font-bold text-[#9C9189] uppercase tracking-widest">Caliber</span>
                                </div>
                                <p className="font-mono text-sm text-[#1A1714]">{watch.caliber || "Automatic"}</p>
                            </div>

                            <div className="p-4 bg-[#FAFAF8] rounded-sm border border-[#E0D9CC]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info size={14} className="text-[#9C9189]" />
                                    <span className="text-[10px] font-bold text-[#9C9189] uppercase tracking-widest">Material</span>
                                </div>
                                <p className="font-sans font-medium text-sm text-[#1A1714]">{watch.case_material || "Steel"}</p>
                            </div>

                            <div className="p-4 bg-[#FAFAF8] rounded-sm border border-[#E0D9CC]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplets size={14} className="text-[#9C9189]" />
                                    <span className="text-[10px] font-bold text-[#9C9189] uppercase tracking-widest">Water Res.</span>
                                </div>
                                <p className="font-sans font-medium text-sm text-[#1A1714]">{watch.water_resistance || "100m"}</p>
                            </div>

                            <div className="p-4 bg-[#FAFAF8] rounded-sm border border-[#E0D9CC] col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={14} className="text-[#9C9189]" />
                                    <span className="text-[10px] font-bold text-[#9C9189] uppercase tracking-widest">Era / Year</span>
                                </div>
                                <p className="font-sans font-medium text-sm text-[#1A1714]">{watch.year_introduced || "Modern"}</p>
                            </div>
                        </div>

                        <p className="text-center text-xs text-[#9C9189] mt-6 italic font-serif">
                            "You never actually own a {watch.brand}. You merely look after it for the next generation."
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
