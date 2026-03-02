"use client";

import React from "react";
import { IndianRupee } from "lucide-react";
import { formatINR } from "@/lib/format";

interface CurrencyProps {
    amount: number;
    className?: string;
    iconSize?: number;
}

export const Currency: React.FC<CurrencyProps> = ({ amount, className = "", iconSize = 14 }) => {
    return (
        <span className={`inline-flex items-center gap-0.5 ${className}`}>
            <IndianRupee size={iconSize} strokeWidth={2.5} className="shrink-0" />
            <span>{formatINR(amount)}</span>
        </span>
    );
};
