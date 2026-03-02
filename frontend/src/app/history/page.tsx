"use client";

import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    MapPin,
    Navigation,
    Calendar,
    Clock,
    CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { Currency } from "@/components/Currency";

export default function RideHistory() {
    const [rides, setRides] = useState([
        {
            id: "1",
            pickup: "Marina Beach, Chennai",
            destination: "Chennai Central Station",
            date: "25 Feb 2026",
            time: "10:30 AM",
            fare: 245,
            status: "completed",
            vehicle: "Weefly XL"
        },
        {
            id: "2",
            pickup: "Tidel Park, Tharamani",
            destination: "Phoenix Marketcity",
            date: "24 Feb 2026",
            time: "06:15 PM",
            fare: 180,
            status: "completed",
            vehicle: "Weefly Go"
        },
        {
            id: "3",
            pickup: "Besant Nagar",
            destination: "Ekkaduthangal",
            date: "22 Feb 2026",
            time: "09:00 AM",
            fare: 150,
            status: "cancelled",
            vehicle: "Weefly Go"
        }
    ]);

    return (
        <main className="min-h-screen bg-gray-50 flex justify-center p-0 md:p-8 font-sans">
            <div className="w-full max-w-2xl bg-white md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-primary p-8 text-white relative">
                    <Link href="/" className="absolute left-6 top-9 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight">Your Journeys</h1>
                        <p className="text-accent text-xs font-bold uppercase tracking-widest mt-1">Weefly Ride History</p>
                    </div>
                </div>

                {/* List */}
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {rides.map((ride, idx) => (
                        <motion.div
                            key={ride.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white border border-gray-100 rounded-[30px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            {/* Status Badge */}
                            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${ride.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {ride.status}
                            </div>

                            <div className="flex gap-4 mb-6">
                                <div className="p-3 bg-gray-50 rounded-2xl text-primary group-hover:bg-accent group-hover:text-primary transition-colors">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-primary">{ride.date}</p>
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        <Clock size={12} /> {ride.time} • {ride.vehicle}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 relative pl-4 border-l-2 border-dashed border-gray-100 ml-4 pb-2">
                                <div className="relative">
                                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Pickup</p>
                                    <p className="font-bold text-sm text-primary leading-tight mt-0.5">{ride.pickup}</p>
                                </div>
                                <div className="relative pt-2">
                                    <div className="absolute -left-[23px] top-3.5 w-3 h-3 rounded-full bg-accent border-2 border-white shadow-sm"></div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Drop-off</p>
                                    <p className="font-bold text-sm text-primary leading-tight mt-0.5">{ride.destination}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                                        <CreditCard size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700"><Currency amount={ride.fare} iconSize={14} /></span>
                                </div>
                                <button className="text-accent font-bold text-xs uppercase tracking-widest hover:underline">Get Invoice</button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Summary */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Lifetime Savings</p>
                        <p className="text-2xl font-black text-primary"><Currency amount={1240} iconSize={24} /> <span className="text-green-500 text-sm">↑</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Rides</p>
                        <p className="text-2xl font-black text-primary">24</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
