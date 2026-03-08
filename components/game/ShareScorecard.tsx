import React, { forwardRef } from "react";
import Image from "next/image";
import { RoundResult } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { getWatchImagePath } from "@/lib/assets";

interface ShareScorecardProps {
    results: RoundResult[];
    totalScore: number;
    accuracy: number;
    gameModeLabel: string;
    rankLabel: string;
}

const ShareScorecard = forwardRef<HTMLDivElement, ShareScorecardProps>(
    ({ results, totalScore, accuracy, gameModeLabel, rankLabel }, ref) => {
        return (
            <div
                ref={ref}
                style={{
                    width: 1080,
                    height: 1080,
                    background: "#1A1714", // Dark premium background
                    color: "#FFFFFF",
                    padding: 80,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                            <span style={{ fontFamily: "serif", fontSize: 64, fontWeight: "bold", color: "#FFFFFF" }}>Watch</span>
                            <span style={{ fontFamily: "serif", fontSize: 64, fontWeight: "bold", fontStyle: "italic", color: "#B8962E" }}>Guesser</span>
                        </div>
                        <p style={{ fontSize: 28, color: "#C8BFB5", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 12, fontWeight: 600 }}>
                            {gameModeLabel}
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 24, color: "#9C9189", textTransform: "uppercase", letterSpacing: "0.1em" }}>Score</p>
                        <p style={{ fontSize: 80, fontFamily: "monospace", fontWeight: "bold", color: "#B8962E", lineHeight: 1 }}>
                            {totalScore.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Middle Stats */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #332E28", borderBottom: "2px solid #332E28", padding: "40px 0" }}>
                    <div>
                        <p style={{ fontSize: 24, color: "#9C9189", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Rank</p>
                        <p style={{ fontSize: 48, fontWeight: "bold", color: "#F5EDD0" }}>{rankLabel}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 24, color: "#9C9189", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Accuracy</p>
                        <p style={{ fontSize: 48, fontWeight: "bold", color: "#FFFFFF", fontFamily: "monospace" }}>{accuracy}%</p>
                    </div>
                </div>

                {/* Watches Grid */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
                    {results.map((result, i) => {
                        const outcomeColor = result.brandCorrect && result.modelCorrect
                            ? "#1A6B3A" : result.brandCorrect ? "#8A6A00" : "#9B2335";
                        return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", background: "#FFFFFF", borderRadius: 16, padding: 24 }}>
                                <div style={{ width: 120, height: 120, position: "relative", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getWatchImagePath(result.watch.image_name)}
                                        alt={result.watch.name}
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                        crossOrigin="anonymous"
                                    />
                                </div>
                                {result.brandCorrect && result.modelCorrect ? (
                                    <CheckCircle2 size={48} color={outcomeColor} />
                                ) : result.brandCorrect ? (
                                    <CheckCircle2 size={48} color={outcomeColor} />
                                ) : (
                                    <XCircle size={48} color={outcomeColor} />
                                )}
                                <p style={{ marginTop: 16, fontSize: 32, fontFamily: "monospace", fontWeight: "bold", color: result.pointsEarned > 0 ? "#B8962E" : "#C8BFB5" }}>
                                    {result.pointsEarned > 0 ? `+${result.pointsEarned}` : "0"}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ textAlign: "center", marginTop: 40 }}>
                    <p style={{ fontSize: 24, color: "#C8BFB5", letterSpacing: "0.1em" }}>
                        Play now at <span style={{ color: "#B8962E", fontWeight: "bold" }}>watchguesser.watch</span>
                    </p>
                </div>
            </div>
        );
    }
);

ShareScorecard.displayName = "ShareScorecard";

export default ShareScorecard;
