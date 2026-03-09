"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    Car,
    DollarSign,
    FileText,
    AlertCircle,
    TrendingUp,
    MapPin,
    Clock,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Menu,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatINR } from "@/lib/format";
import { Currency } from "@/components/Currency";
import { getApiBase } from "@/lib/api";

const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'drivers', label: 'Drivers & Vehicles', icon: Users },
    { id: 'pricing', label: 'Pricing Config', icon: DollarSign },
    { id: 'trips', label: 'Trip Monitor', icon: MapPin },
    { id: 'reports', label: 'Disputes & Reports', icon: AlertCircle },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAdminAuthenticated) return;
        const fetchStats = async () => {
            try {
                const API_BASE = getApiBase();
                const res = await fetch(`${API_BASE}/api/admin/stats`);
                const data = await res.json();
                if (data.success) setStats(data.stats);
            } catch (err) {
                console.error("Stats error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [isAdminAuthenticated]);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded credentials as per user request
        if (adminEmail === 'admin@weefly.com' && adminPassword === 'weefly123') {
            setIsAdminAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Invalid Administrator credentials');
        }
    };

    if (!isAdminAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-sans tracking-tight">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/10 p-12 rounded-[48px] w-[90%] max-w-md relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-[60px] -mr-24 -mt-24" />

                    <div className="w-16 h-16 rounded-full bg-accent/20 mx-auto border border-accent/20 flex items-center justify-center text-accent mb-8">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>

                    <h1 className="text-3xl tracking-tighter text-white font-black uppercase">Weefly <span className="text-accent">Admin</span></h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[4px] font-black mt-2 mb-8">System Access Portal</p>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="ADMIN EMAIL"
                            value={adminEmail}
                            onChange={e => setAdminEmail(e.target.value)}
                            required
                            className="w-full text-center bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent transition-colors"
                        />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            value={adminPassword}
                            onChange={e => setAdminPassword(e.target.value)}
                            required
                            className="w-full text-center bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent transition-colors"
                        />

                        {loginError && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{loginError}</p>}

                        <button type="submit" className="w-full bg-accent text-primary h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all mt-4 shadow-xl shadow-accent/10">
                            Authorize Access
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab stats={stats} onNavigate={setActiveTab} />;
            case 'drivers': return <DriversTab />;
            case 'pricing': return <PricingTab />;
            case 'trips': return <TripsTab />;
            case 'reports': return <ReportsTab />;
            default: return <OverviewTab stats={stats} onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-accent selection:text-primary">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`w-64 border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col fixed h-full z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span className="text-xl font-black tracking-tighter uppercase">Weefly <span className="text-accent">Admin</span></span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {SIDEBAR_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === item.id
                                    ? 'bg-accent text-primary shadow-lg shadow-accent/20'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <Users size={18} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Master Admin</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">System Level</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow md:ml-64 p-6 md:p-12 relative overflow-hidden transition-all duration-300">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10">
                    <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-all text-white/60">
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white capitalize">{activeTab} <span className="text-accent">Center</span></h1>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px] mt-2">Managing the Weefly Ecosystem</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 md:flex-none bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-all text-white/60 flex justify-center items-center">
                                <Search size={20} />
                            </button>
                            <button className="flex-[2] md:flex-none bg-accent text-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-accent/10">
                                Export Data
                            </button>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function OverviewTab({ stats, onNavigate }: { stats: any, onNavigate: (tab: string) => void }) {
    if (!stats) return <div className="animate-pulse space-y-8">...Loading Dashboard Data</div>;

    const cards = [
        { id: 'pricing', label: 'Total Revenue', value: <Currency amount={stats.totalRevenue} iconSize={20} />, trend: '+12.5%', color: 'accent', icon: DollarSign },
        { id: 'drivers', label: 'Active Drivers', value: stats.activeDrivers, trend: '+4.2%', color: 'blue', icon: Users },
        { id: 'trips', label: 'Total Trips', value: stats.totalRides, trend: '+28.1%', color: 'purple', icon: TrendingUp },
        { id: 'reports', label: 'Open Reports', value: stats.openReports, trend: '-2.5%', color: 'red', icon: AlertCircle },
    ];

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => onNavigate(card.id)}
                        className="bg-white/[0.03] border border-white/5 p-8 rounded-[40px] relative overflow-hidden group hover:bg-white/[0.08] hover:border-accent/40 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/10 rounded-full blur-3xl -mr-12 -mt-12`} />
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                {card.trend}
                            </span>
                        </div>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</p>
                        <h3 className="text-3xl font-black tracking-tighter">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[48px] flex flex-col justify-center items-center text-center">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-6">Average Driver Rating</h4>
                    <div className="relative">
                        <div className="text-7xl font-black text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                            {stats.avgDriverRating ? stats.avgDriverRating.toFixed(1) : '0.0'}
                        </div>
                        <div className="flex gap-1 justify-center mt-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className={`w-6 h-6 ${star <= Math.round(stats.avgDriverRating) ? 'text-accent fill-accent' : 'text-white/20'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[48px]">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-sm font-black uppercase tracking-widest text-accent">Top Cities by Volume</h4>
                    </div>
                    <div className="space-y-4">
                        {stats.cityStats && stats.cityStats.length > 0 ? stats.cityStats.map((city: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xs text-white/60">#{i + 1}</div>
                                <div className="flex-grow flex items-center justify-between">
                                    <p className="font-bold tracking-tight text-white">{city.city}</p>
                                    <p className="text-[10px] font-black tracking-widest uppercase text-accent bg-accent/10 px-3 py-1 rounded-full">{city.count} Rides</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-white/20 font-black uppercase tracking-widest">No city data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DriversTab() {
    const [drivers, setDrivers] = useState<any[]>([]);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = () => {
        const API_BASE = getApiBase();
        fetch(`${API_BASE}/api/admin/drivers`)
            .then(res => res.json())
            .then(data => { if (data.success) setDrivers(data.drivers); });
    };

    const handleKycStatus = async (id: string, status: string) => {
        try {
            const API_BASE = getApiBase();
            const res = await fetch(`${API_BASE}/api/admin/kyc/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchDrivers();
        } catch (err) { console.error(err); }
    };

    const handleSuspension = async (id: string, isSuspended: boolean) => {
        try {
            const API_BASE = getApiBase();
            const res = await fetch(`${API_BASE}/api/admin/drivers/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isSuspended })
            });
            if (res.ok) fetchDrivers();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex gap-4">
                    <button className="flex-grow md:flex-none bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">All Drivers</button>
                    <button className="flex-grow md:flex-none text-white/40 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white">Pending Approval</button>
                </div>
                <button className="bg-accent/10 text-accent border border-accent/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors">
                    <Plus size={14} /> Add New Driver
                </button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-white/[0.03] border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Driver</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Phone</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {drivers.length > 0 ? drivers.map((driver, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center font-black text-accent text-xs">
                                                {driver.name ? driver.name[0] : 'D'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{driver.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">VEH: {driver.vehicleNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-white/60">{driver.phoneNumber}</td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${driver.isOnline ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/40'}`}>
                                            {driver.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-black">4.9</span>
                                                <AlertCircle size={10} className="fill-accent text-accent" />
                                            </div>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest mt-1 ${driver.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' : driver.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-500'}`}>KYC: {driver.kycStatus}</span>
                                            {driver.isSuspended && <span className="text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest bg-red-500 text-white mt-1">Suspended</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2 relative group-button">
                                            <div className="flex flex-col gap-1 w-24">
                                                {driver.kycStatus === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleKycStatus(driver._id, 'verified')} className="text-[8px] bg-green-500/20 text-green-400 py-1 rounded hover:bg-green-500 hover:text-white uppercase tracking-widest font-black transition">Approve KYC</button>
                                                        <button onClick={() => handleKycStatus(driver._id, 'rejected')} className="text-[8px] bg-red-500/20 text-red-400 py-1 rounded hover:bg-red-500 hover:text-white uppercase tracking-widest font-black transition">Reject KYC</button>
                                                    </>
                                                )}
                                                {driver.kycStatus === 'verified' && (
                                                    <button onClick={() => handleSuspension(driver._id, !driver.isSuspended)} className={`text-[8px] py-1 rounded uppercase tracking-widest font-black transition ${driver.isSuspended ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'}`}>
                                                        {driver.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center opacity-20">
                                        <Users size={40} className="mx-auto mb-4" />
                                        <p className="font-black uppercase tracking-[4px]">No drivers found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function PricingTab() {
    const [platformFee, setPlatformFee] = useState<number>(15);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const API_BASE = getApiBase();
        fetch(`${API_BASE}/api/admin/config`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.config) {
                    const feeObj = data.config.find((c: any) => c.key === 'platform_fee');
                    if (feeObj) setPlatformFee(feeObj.value);
                }
            });
    }, []);

    const updatePlatformFee = async () => {
        setIsUpdating(true);
        try {
            const API_BASE = getApiBase();
            await fetch(`${API_BASE}/api/admin/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'platform_fee', value: platformFee, description: 'Platform Commission %' })
            });
            setTimeout(() => setIsUpdating(false), 1000);
        } catch (err) {
            console.error(err);
            setIsUpdating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[48px] space-y-8">
                <h4 className="text-sm font-black uppercase tracking-widest text-accent">Base Fare Configuration</h4>
                <div className="space-y-6">
                    {[
                        { label: 'Weefly Bike', base: 40, perKm: 8 },
                        { label: 'Weefly Mini', base: 120, perKm: 15 },
                        { label: 'Weefly Sedan', base: 180, perKm: 22 },
                        { label: 'Weefly SUV', base: 280, perKm: 35 },
                    ].map((v, i) => (
                        <div key={i} className="flex justify-between items-center p-6 border border-white/5 rounded-3xl bg-white/[0.03]">
                            <div>
                                <p className="font-bold tracking-tight">{v.label}</p>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Base: <Currency amount={v.base} iconSize={10} /> • per km: <Currency amount={v.perKm} iconSize={10} /></p>
                            </div>
                            <button className="text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20 px-4 py-2 rounded-xl hover:bg-accent hover:text-primary transition-all">Edit</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[48px]">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-8">Dynamic Surge Rules</h4>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white/60">Midnight Surcharge (00:00 - 05:00)</span>
                            <div className="w-12 h-6 bg-accent rounded-full relative"><div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full" /></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white/60">Peak Hour Multiplier</span>
                            <span className="text-xs font-black text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest">1.5x Active</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white/60">Rain/Weather Surge</span>
                            <div className="w-12 h-6 bg-white/10 rounded-full relative"><div className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full" /></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[48px]">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-8">Platform Fee</h4>
                    <div className="flex items-end gap-2">
                        <input
                            type="number"
                            value={platformFee}
                            onChange={(e) => setPlatformFee(Number(e.target.value))}
                            className="text-5xl font-black bg-transparent w-24 border-b-2 border-white/20 focus:outline-none focus:border-accent"
                        />
                        <span className="text-sm font-black text-white/40 mb-2">%</span>
                    </div>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-4">Calculated per trip after taxes</p>
                    <button onClick={updatePlatformFee} className={`w-full mt-8 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isUpdating ? 'bg-green-500 text-white' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
                        {isUpdating ? 'Updated!' : 'Update Platform Fee'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TripsTab() {
    const [trips, setTrips] = useState<any[]>([]);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = () => {
        const API_BASE = getApiBase();
        fetch(`${API_BASE}/api/admin/trips`)
            .then(res => res.json())
            .then(data => { if (data.success) setTrips(data.trips); });
    };

    const handleTripAction = async (id: string, action: 'cancel' | 'refund') => {
        try {
            const API_BASE = getApiBase();
            const res = await fetch(`${API_BASE}/api/admin/trips/${id}/refund`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) fetchTrips();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-white/[0.03] border-b border-white/5">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">ID</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Driver</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Routes</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Fare</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {trips.length > 0 ? trips.map((trip, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6 text-xs font-black text-white/40 font-mono uppercase">#{trip._id.slice(-6)}</td>
                                <td className="px-8 py-6">
                                    <p className="font-bold text-sm tracking-tight">{trip.userId?.name || 'Local User'}</p>
                                    <p className="text-[10px] text-white/40 font-black tracking-widest uppercase">{trip.userId?.phoneNumber}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-bold text-sm tracking-tight">{trip.driver?.name || 'N/A'}</p>
                                    <p className="text-[10px] text-white/40 font-black tracking-widest uppercase">{trip.driver?.vehicleNumber || 'No Driver Assigned'}</p>
                                </td>
                                <td className="px-8 py-6 max-w-[200px]">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium truncate text-white/60">From: {trip.pickupLocation.address}</p>
                                        <p className="text-xs font-medium truncate text-white/60">To: {trip.destinationLocation.address}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6"><Currency amount={trip.fare} className="text-accent" iconSize={12} /></td>
                                <td className="px-8 py-6">
                                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${trip.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                        trip.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                            'bg-accent/10 text-accent animate-pulse'
                                        }`}>
                                        {trip.refundStatus === 'processed' ? 'Refunded' : trip.status}
                                    </span>
                                    <div className="mt-2 flex gap-1">
                                        {(trip.status !== 'completed' && trip.status !== 'cancelled') && (
                                            <button onClick={() => handleTripAction(trip._id, 'cancel')} className="text-[8px] bg-red-500/20 text-red-400 py-1 px-2 rounded hover:bg-red-500 hover:text-white uppercase tracking-widest font-black transition">Force Cancel</button>
                                        )}
                                        {(trip.status === 'cancelled' && trip.refundStatus !== 'processed') && (
                                            <button onClick={() => handleTripAction(trip._id, 'refund')} className="text-[8px] bg-blue-500/20 text-blue-400 py-1 px-2 rounded hover:bg-blue-500 hover:text-white uppercase tracking-widest font-black transition">Process Refund</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center opacity-20 font-black uppercase tracking-[4px]">No trip history found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ReportsTab() {
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = () => {
        const API_BASE = getApiBase();
        fetch(`${API_BASE}/api/admin/reports`)
            .then(res => res.json())
            .then(data => { if (data.success) setReports(data.reports); });
    };

    const resolveReport = async (id: string) => {
        try {
            const API_BASE = getApiBase();
            const res = await fetch(`${API_BASE}/api/admin/reports/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'resolved' })
            });
            if (res.ok) fetchReports();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-4">Unresolved Issues</h4>
                {reports.filter(r => r.status !== 'resolved').map((r, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-[32px] hover:border-accent/40 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${r.priority === 'critical' ? 'bg-red-500 text-white' :
                                r.priority === 'high' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                {r.priority || 'medium'}
                            </span>
                        </div>
                        <p className="font-bold text-sm mb-1">{r.userId?.name || 'User'}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">{r.type}</p>
                        <p className="text-xs text-white/60 mb-4">{r.description}</p>
                        <div className="flex gap-2">
                            <button className="flex-grow bg-white/5 border border-white/10 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-accent hover:text-primary hover:border-accent transition-all">Review</button>
                            <button onClick={() => resolveReport(r._id)} className="px-4 bg-green-500/10 text-green-500 border border-green-500/20 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Resolve</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="col-span-2 bg-white/[0.02] border border-white/5 p-10 rounded-[48px] flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                    <AlertCircle size={40} className="text-white/20" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Select a report to view details</h3>
                    <p className="text-sm text-white/40 max-w-sm mx-auto">Click on any unresolved issue on the left to start investigating and resolving the user dispute.</p>
                </div>
            </div>
        </div>
    );
}
