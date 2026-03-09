"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search,
  MapPin,
  Navigation,
  Car,
  Clock,
  ChevronRight,
  CreditCard,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Star,
  X,
  CarFront,
  Zap,
  Diamond,
  LogOut,
  Bike,
  Users,
  LayoutDashboard,
  Wallet,
  Settings,
  Bell,
  CheckCircle2,
  Navigation2,
  Power,
  AlertTriangle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map Engine...</div>
});

import { SuggestionsDropdown } from "@/components/SuggestionsDropdown";
import { formatINR } from "@/lib/format";
import { Currency } from "@/components/Currency";
import { getApiBase } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [bookingStep, setBookingStep] = useState(0); // 0: Search, 1: Select, 2: Searching, 3: Assigned
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [fareData, setFareData] = useState<any>(null);
  const [assignedRide, setAssignedRide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // null, 'customer', 'driver', 'admin'
  const [rideType, setRideType] = useState<"instant" | "schedule">("instant");
  const [scheduledTime, setScheduledTime] = useState("");
  const [trackProgress, setTrackProgress] = useState(0);
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [suggestions, setSuggestions] = useState<{ pickup: any[], destination: any[] }>({ pickup: [], destination: [] });
  const [isSearchingLoc, setIsSearchingLoc] = useState({ pickup: false, destination: false });
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestionsFor, setShowSuggestionsFor] = useState<'pickup' | 'destination' | null>(null);

  const fetchSuggestions = async (query: string, field: 'pickup' | 'destination') => {
    if (!query || query.length < 2) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    setIsSearchingLoc(prev => ({ ...prev, [field]: true }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&accept-language=en`);
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [field]: data }));
    } catch (err) {
      console.error("Suggestion error:", err);
    } finally {
      setIsSearchingLoc(prev => ({ ...prev, [field]: false }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSuggestionsFor === 'pickup') fetchSuggestions(pickup, 'pickup');
      if (showSuggestionsFor === 'destination') fetchSuggestions(destination, 'destination');
    }, 400);
    return () => clearTimeout(timer);
  }, [pickup, destination, showSuggestionsFor]);

  const handleSuggestionSelect = (suggestion: any, field: 'pickup' | 'destination') => {
    const name = suggestion.display_name;
    const coords: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];

    if (field === 'pickup') {
      setPickup(name);
      setPickupCoords(coords);
    } else {
      setDestination(name);
      setDestinationCoords(coords);
    }
    setSuggestions(prev => ({ ...prev, [field]: [] }));
    setShowSuggestionsFor(null);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'pickup' | 'destination') => {
    const list = suggestions[field];
    if (!list.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < list.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0) {
        handleSuggestionSelect(list[activeSuggestionIndex], field);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestionsFor(null);
      setActiveSuggestionIndex(-1);
    }
  };

  const GEO_MOCK: Record<string, [number, number]> = {
    "salem": [11.6643, 78.1460],
    "salem junction": [11.6643, 78.1460],
    "omalur": [11.7516, 78.0494],
    "chennai": [13.0827, 80.2707],
    "marina beach": [13.0475, 80.2824],
    "chennai central": [13.0822, 80.2755],
    "adyar": [13.0063, 80.2574],
    "omr": [12.8943, 80.2222],
    "omr it park": [12.8943, 80.2222],
    "pondicherry": [11.9416, 79.8083],
    "pondicherry white town": [11.9333, 79.8333]
  };

  const getCoords = (loc: string): [number, number] | null => {
    return GEO_MOCK[loc.toLowerCase()] || null;
  };

  // Driver States
  const [isOnline, setIsOnline] = useState(false);
  const [driverEarnings, setDriverEarnings] = useState(1240);
  const [incomingRide, setIncomingRide] = useState<any>(null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [driverOtp, setDriverOtp] = useState('');
  const [driverOtpVerified, setDriverOtpVerified] = useState(false);
  const [driverOtpError, setDriverOtpError] = useState('');
  const [driverNavigating, setDriverNavigating] = useState(false);
  const [walletBalance, setWalletBalance] = useState(4500);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [acceptCountdown, setAcceptCountdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'earnings' | 'profile'>('dashboard');
  const [earningsView, setEarningsView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [driverProfileName, setDriverProfileName] = useState(user?.name || '');
  const [driverVehicleNum, setDriverVehicleNum] = useState(user?.vehicleNumber || '');

  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'info' | 'success' }[]>([]);

  useEffect(() => {
    if (user) {
      setDriverProfileName(user.name || '');
      setDriverVehicleNum(user.vehicleNumber || '');
    }
  }, [user]);
  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const [sosActive, setSosActive] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [ratingVal, setRatingVal] = useState(0);

  const handleSOS = () => {
    setSosActive(true);
    showToast("SOS Alert Triggered! Authorities Notified.", "info");
    setTimeout(() => {
      setSosActive(false);
      showToast("Emergency Response team is tracking your ride.", "success");
    }, 5000);
  };

  const handleAcceptRide = async () => {
    if (!incomingRide) return;
    try {
      const API_BASE = getApiBase();
      const res = await fetch(`${API_BASE}/api/drivers/respond-ride`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: incomingRide.id, status: 'accepted' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
      }
      const data = await res.json();
      if (data.success) {
        setActiveRide(incomingRide);
        setIncomingRide(null);
        setAcceptCountdown(null);
        // Simulate driver being ~3 mins away from pickup
        if (pickupCoords) {
          setDriverLocation([pickupCoords[0] - 0.02, pickupCoords[1] - 0.02]);
        }
      }
    } catch (err: any) {
      console.error("Accept error:", err);
      showToast(`Accept error: ${err.message || 'Server Unreachable'}`, "info");
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    try {
      const API_BASE = getApiBase();
      const res = await fetch(`${API_BASE}/api/drivers/complete-ride`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
      }
      const data = await res.json();
      if (data.success) {
        setDriverEarnings(prev => prev + data.fare);
        setActiveRide(null);
        setDriverLocation(null);
        setDriverOtp('');
        setDriverOtpVerified(false);
        setDriverOtpError('');
        setDriverNavigating(false);
        showToast("Ride completed successfully!", "success");
        setPickupCoords(null);
        setDestinationCoords(null);
        setDriverLocation(null);
        setTrackProgress(0);
      }
    } catch (err: any) {
      console.error("Complete error:", err);
      showToast(`Complete error: ${err.message || 'Server Unreachable'}`, "info");
    }
  };

  const vehicles = [
    { id: 'bike', name: "Weefly Bike", basePrice: 40, time: "2 min", icon: Bike, desc: "Fast & affordable" },
    { id: 'mini', name: "Weefly Mini", basePrice: 120, time: "3 min", icon: Car, desc: "Economy everyday rides" },
    { id: 'sedan', name: "Weefly Sedan", basePrice: 180, time: "4 min", icon: CarFront, desc: "Comfortable premium cars" },
    { id: 'suv', name: "Weefly SUV", basePrice: 280, time: "5 min", icon: Users, desc: "Spacious for 6 people" },
  ];

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    const API_BASE = getApiBase();
    try {
      const res = await fetch(`${API_BASE}/api/drivers/profile/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: driverProfileName, vehicleNumber: driverVehicleNum }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.driver);
        showToast("Profile Settings Saved", "success");
      } else {
        showToast(data.message || "Failed to update top", "info");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating profile", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        setError("Please enter your email and password");
        setIsLoading(false);
        return;
      }

      if (authMode === 'register' && !name) {
        setError("Please enter your name");
        setIsLoading(false);
        return;
      }

      const API_BASE = getApiBase();
      const endpoint = authMode === 'login' ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;

      const payload = authMode === 'login'
        ? { email, password, role: userRole || 'user' }
        : { email, password, name, phoneNumber: phone, role: userRole || 'user' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      if (data.success && data.user) {
        if (authMode === 'register') {
          setAuthMode('login');
          showToast("Registration Successful. Please log in.", "success");
        } else {
          setIsLoggedIn(true);
          setUser(data.user);
          showToast("Login Successful", "success");
        }
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Server error");
    } finally {
      setIsLoading(false);
    }
  };



  const getFares = async () => {
    if (!pickup || !destination) return;
    setIsLoading(true);
    try {
      console.log("[FETCH] Requesting fares...");
      setError(null);
      const API_BASE = getApiBase();
      const res = await fetch(`${API_BASE}/api/ride/fare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, destination, rideType, scheduledTime }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
      }
      const data = await res.json();
      setFareData(data);
      setBookingStep(1);
    } catch (err: any) {
      console.error("Get Fares error:", err);
      setError(err.message || "Server Unreachable. Please run 'npm run dev' in the root project folder.");
    } finally {
      setIsLoading(false);
    }
  };

  const [currentRideId, setCurrentRideId] = useState<string | null>(null);

  const requestRide = async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setBookingStep(2); // Searching
    try {
      const pCoords = pickupCoords || getCoords(pickup);
      const dCoords = destinationCoords || getCoords(destination);
      if (!pickupCoords) setPickupCoords(pCoords);
      if (!destinationCoords) setDestinationCoords(dCoords);

      const API_BASE = getApiBase();
      const res = await fetch(`${API_BASE}/api/ride/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || "64e3f4e5a6c1b2c3d4e5f6g7", // Use actual user ID
          pickup,
          destination,
          pickupCoords: pCoords,
          destinationCoords: dCoords,
          fare: fareData?.fares?.[selectedVehicle]?.surgeFare || 150,
          rideType,
          scheduledTime: rideType === 'schedule' ? scheduledTime : null
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
      }
      const data = await res.json();
      if (data.success) {
        setCurrentRideId(data.rideId);
      } else {
        setError(data.message || "Failed to request ride");
        setBookingStep(1);
      }
    } catch (err) {
      console.error(err);
      setBookingStep(1);
    }
  };

  // Poll for ride assignment
  useEffect(() => {
    let interval: any;
    if (bookingStep === 2 && currentRideId) {
      const checkAssignment = async () => {
        try {
          const API_BASE = getApiBase();
          const res = await fetch(`${API_BASE}/api/admin/trips`);
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
          }
          const data = await res.json();
          if (data.success) {
            const myRide = data.trips.find((t: any) => t._id === currentRideId);
            if (myRide && myRide.status === 'assigned') {
              setAssignedRide(myRide);
              setBookingStep(3);
              setCurrentRideId(null);
              // Set mock driver location relative to pickup
              if (pickupCoords) {
                setDriverLocation([pickupCoords[0] - 0.02, pickupCoords[1] - 0.02]);
              }
              // Set the mock OTP to easily verify
              setDriverOtpVerified(false);
              showToast("Captain Assigned! They are on their way.", "success");
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      };
      interval = setInterval(checkAssignment, 3000);
    }
    return () => clearInterval(interval);
  }, [bookingStep, currentRideId]);

  useEffect(() => {
    let interval: any;
    const isTracking = bookingStep === 3 || bookingStep === 4 || (userRole === 'driver' && activeRide && driverNavigating);
    if (isTracking && trackProgress < 100) {
      interval = setInterval(() => {
        setTrackProgress(prev => {
          const next = Math.min(prev + 1, 100);
          if (next === 100 && prev < 100) {
            if (bookingStep === 3 || (userRole === 'driver' && activeRide && bookingStep !== 4)) {
              showToast("Captain has arrived at the pickup location.", "success");
            } else {
              showToast("You have reached your destination! Hope you enjoyed the ride.", "success");
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [bookingStep, trackProgress, userRole, activeRide, driverNavigating]);

  // Poll for real-time ride completion by driver
  useEffect(() => {
    let interval: any;
    if (userRole !== 'driver' && assignedRide && (bookingStep === 3 || bookingStep === 4)) {
      const checkCompletion = async () => {
        try {
          const API_BASE = getApiBase();
          const res = await fetch(`${API_BASE}/api/admin/trips`);
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
          }
          const data = await res.json();
          if (data.success) {
            const myRide = data.trips.find((t: any) => t._id === assignedRide._id);
            if (myRide && myRide.status === 'completed') {
              setTrackProgress(100);
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error("Completion polling error:", err);
        }
      };
      interval = setInterval(checkCompletion, 3000);
    }
    return () => clearInterval(interval);
  }, [assignedRide, bookingStep, userRole]);

  // Countdown timer for incoming rides
  useEffect(() => {
    let timer: any;
    if (incomingRide && acceptCountdown === null) {
      setAcceptCountdown(30);
    }
    if (acceptCountdown !== null && acceptCountdown > 0) {
      timer = setInterval(() => {
        setAcceptCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (acceptCountdown === 0) {
      setIncomingRide(null);
      setAcceptCountdown(null);
      setPickupCoords(null);
      setDestinationCoords(null);
    }
    return () => clearInterval(timer);
  }, [incomingRide, acceptCountdown]);

  // Real-Time Ride Fetching for Drivers
  useEffect(() => {
    let interval: any;
    if (userRole === 'driver' && isOnline && !activeRide) {
      const fetchRequests = async () => {
        try {
          const API_BASE = getApiBase();
          const res = await fetch(`${API_BASE}/api/drivers/active-requests`);
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
          }
          const data = await res.json();
          if (data.success && data.requests && data.requests.length > 0) {
            const firstReq = data.requests[0];
            setIncomingRide({
              id: firstReq._id,
              customer: firstReq.userId?.name || "Local Customer",
              pickup: firstReq.pickupLocation.address,
              destination: firstReq.destinationLocation.address,
              fare: firstReq.fare,
              distance: "Calculating...",
              raw: firstReq
            });
            setPickupCoords(firstReq.pickupLocation.coordinates || getCoords(firstReq.pickupLocation.address));
            setDestinationCoords(firstReq.destinationLocation.coordinates || getCoords(firstReq.destinationLocation.address));
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      };

      fetchRequests();
      interval = setInterval(fetchRequests, 5000);
    }
    return () => clearInterval(interval);
  }, [userRole, isOnline, activeRide]);

  const handleVerifyDriverOtp = async () => {
    if (!activeRide) return;
    setDriverOtpError('');
    try {
      const API_BASE = getApiBase();
      const res = await fetch(`${API_BASE}/api/drivers/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id, otp: driverOtp })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
      }
      const data = await res.json();
      if (data.success) {
        setDriverOtpVerified(true);
        showToast("OTP Verified! Navigation started.", "success");
      } else {
        setDriverOtpError(data.message || "Invalid OTP entered");
      }
    } catch (err) {
      console.error(err);
      setDriverOtpError("Failed to verify OTP");
    }
  };

  const roles = [
    { id: 'customer', label: "Customer" },
    { id: 'driver', label: "Driver" },
    { id: 'admin', label: "Admin" }
  ];

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen w-screen bg-black overflow-x-hidden font-sans relative">
        {/* Cinematic Background */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.4] scale-105"
          style={{ backgroundImage: 'url("/bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

        {/* Navigation */}
        <nav className="relative z-20 flex justify-between items-center px-6 md:px-12 py-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xl font-black text-white tracking-tighter uppercase">Weefly <span className="text-accent">Cab</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-white/60 text-xs font-bold uppercase tracking-widest">
            <button className="hover:text-accent transition-colors">Why Choose Us</button>
            <button className="hover:text-accent transition-colors">About Us</button>
            <button className="hover:text-accent transition-colors">Contact</button>
          </div>
          <button className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all">
            <UserIcon size={18} className="text-white" />
          </button>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center pt-10 pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
          >
            {/* Role Switcher */}
            <div className="flex p-2 gap-1 bg-black/40 rounded-t-[48px]">
              {roles.map(r => {
                const isActive = r.id === (userRole || 'customer');
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      if (r.id === 'admin') {
                        router.push('/admin');
                        return;
                      }
                      if (!isActive) {
                        setUserRole(r.id);
                        setError(null);
                      }
                    }}
                    className={`flex-grow py-3 px-6 rounded-3xl font-black text-[10px] uppercase tracking-wider transition-all ${isActive ? 'bg-accent text-primary' : 'text-white/40 hover:text-white font-bold'
                      }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            <div className="p-10 text-center space-y-8">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-white/40 text-sm">
                  {authMode === 'login' ? 'Log in with your email and password' : 'Sign up to start your journey'}
                </p>
              </div>

              <div className="space-y-4">
                {authMode === 'register' && (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-[24px] focus:border-accent focus:ring-1 focus:ring-accent outline-none font-bold text-white transition-all"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-[24px] focus:border-accent focus:ring-1 focus:ring-accent outline-none font-bold text-white transition-all"
                    />
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-[24px] focus:border-accent focus:ring-1 focus:ring-accent outline-none font-bold text-white transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-black/40 border border-white/5 h-16 px-6 rounded-[24px] focus:border-accent focus:ring-1 focus:ring-accent outline-none font-bold text-white transition-all"
                />

                <button
                  disabled={isLoading}
                  onClick={handleLogin}
                  className="w-full bg-accent text-primary h-16 rounded-[24px] font-black text-sm uppercase tracking-[2px] shadow-xl shadow-accent/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : (authMode === 'login' ? 'Login →' : 'Sign Up →')}
                </button>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setError(null);
                    }}
                    className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                  </button>
                </div>

                {error && <p className="text-red-400 text-[10px] font-bold mt-2 uppercase tracking-wide">{error}</p>}



                <p className="text-white/20 text-[10px] uppercase tracking-wider">
                  Don't have an account? <span className="text-accent cursor-pointer">Join us here</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature Section */}
          <div className="max-w-7xl mx-auto w-full mt-32 space-y-12">
            <div className="text-center">
              <p className="text-accent font-black text-[10px] uppercase tracking-[4px] mb-2">The Weefly Advantage</p>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Why Choose Weefly?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {[
                { icon: ShieldCheck, title: "Safe & Secure", desc: "Verified drivers and real-time ride tracking for your peace of mind.", color: "red" },
                { icon: Zap, title: "Fast Response", desc: "Get a cab in minutes. No more waiting on the street.", color: "yellow" },
                { icon: Diamond, title: "Premium Experience", desc: "Luxury vehicles at affordable prices, every single time.", color: "blue" }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/[0.03] backdrop-blur-lg border border-white/5 p-10 rounded-[40px] text-center group hover:bg-white/[0.05] transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`text-${feature.color}-500`} size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 border-t border-white/5 text-center text-white/20 text-[10px] uppercase tracking-[8px]">
          Tamil Nadu • Chennai • Pondicherry
        </footer>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Map Background */}
      <div className="flex-grow relative h-[45vh] md:h-full">
        <Map
          zoom={12}
          pickupCoords={
            (userRole === 'driver' && activeRide && driverNavigating)
              ? pickupCoords || undefined
              : (bookingStep === 3) ? driverLocation || undefined : pickupCoords || undefined
          }
          destinationCoords={
            (userRole === 'driver' && activeRide && driverNavigating)
              ? destinationCoords || undefined
              : (bookingStep === 3) ? pickupCoords || undefined : destinationCoords || undefined
          }
          trackProgress={(bookingStep === 3 || bookingStep === 4 || (userRole === 'driver' && activeRide && driverNavigating)) ? trackProgress : 0}
        />

        {/* Floating Profile */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setUserRole(null);
            }}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <LogOut size={16} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logout</span>
          </button>
        </div>

        <div className="absolute top-6 right-6 z-10 flex gap-3">
          {isLoggedIn && (
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-primary uppercase tracking-tight">Active</span>
            </div>
          )}
          <button
            onClick={() => userRole === 'customer' ? setShowHistory(true) : null}
            className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/40 hover:scale-105 transition-transform active:scale-95"
          >
            <UserIcon size={24} className={isLoggedIn ? "text-accent" : "text-primary"} />
          </button>
        </div>
      </div>

      {/* Role-Based Side Panel */}
      {userRole === 'driver' ? (
        <div className="w-full md:w-[420px] bg-white h-[65vh] md:h-full z-10 shadow-2xl flex flex-col relative md:rounded-l-[40px] mt-[-40px] md:mt-0 pt-8 pb-10 px-6 transition-all duration-500 overflow-hidden">
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Driver <span className="text-accent">Console</span></h1>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Captain ID: #WF-9921</p>
              </div>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${isOnline ? 'border-green-100 bg-green-50 text-green-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
              >
                <Power size={14} className={isOnline ? "animate-pulse" : ""} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? "Online" : "Offline"}</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-1">
              {(['dashboard', 'wallet', 'earnings', 'profile'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-primary'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'dashboard' && (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Earnings</p>
                    <p className="text-2xl font-black text-primary"><Currency amount={driverEarnings} iconSize={18} /></p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-black text-primary">4.9</p>
                      <Star size={14} className="fill-accent text-accent" />
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {incomingRide && (
                    <motion.div key="incoming" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-primary text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-accent uppercase tracking-[4px]">New Request Found</p>
                        {acceptCountdown !== null && (
                          <div className="bg-accent text-primary px-3 py-1 rounded-full text-[10px] font-black">
                            {acceptCountdown}s
                          </div>
                        )}
                      </div>
                      <div className="space-y-4 mb-8">
                        <div>
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Pick up</p>
                          <p className="font-bold text-lg">{incomingRide.pickup}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Drop off</p>
                          <p className="font-bold text-lg">{incomingRide.destination}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <p className="text-3xl font-black"><Currency amount={incomingRide.fare} iconSize={24} /></p>
                          <p className="text-[10px] text-white/40 font-bold uppercase">{incomingRide.distance}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{incomingRide.customer}</p>
                          <div className="flex items-center gap-1 justify-end">
                            <Star size={10} className="fill-accent text-accent" />
                            <span className="text-[10px] font-bold">4.8</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleAcceptRide} className="flex-grow bg-accent text-primary h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all">Accept Ride</button>
                        <button onClick={() => { setIncomingRide(null); setPickupCoords(null); setDestinationCoords(null); setAcceptCountdown(null); }} className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><X size={20} /></button>
                      </div>
                    </motion.div>
                  )}

                  {activeRide && (
                    <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="bg-accent/5 border border-accent/20 p-8 rounded-[40px] space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-accent uppercase tracking-[2px]">Current Ride</p>
                            <h3 className="text-2xl font-bold text-primary truncate max-w-[200px]">Heading to {activeRide.destination}</h3>
                          </div>
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Navigation2 size={24} className="text-accent" />
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-accent/10">
                          {driverOtpVerified ? (
                            <>
                              <button
                                onClick={() => {
                                  setDriverNavigating(true);
                                  showToast("Navigating to Pickup Location", "success");
                                }}
                                disabled={driverNavigating}
                                className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 border shadow-sm transition-all ${driverNavigating ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-primary border-accent/10 hover:bg-gray-50'}`}
                              >
                                <MapPin size={18} className={driverNavigating ? 'text-gray-400' : 'text-accent'} />
                                {driverNavigating ? "Navigation Active" : "Navigate to Pickup"}
                              </button>
                              <div className="flex gap-3">
                                <button className="flex-grow bg-white text-primary h-14 rounded-2xl font-bold border border-gray-100 flex items-center justify-center gap-2">
                                  <Phone size={18} />
                                  Call
                                </button>
                                <button onClick={handleCompleteRide} className="flex-grow bg-primary text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2">
                                  <CheckCircle2 size={18} className="text-accent" />
                                  Complete
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                              <div>
                                <h4 className="text-sm font-bold text-primary mb-1">Enter Customer OTP</h4>
                                <p className="text-xs text-gray-500">Ask the customer for the 4-digit PIN to start the ride and show the map directions.</p>
                              </div>
                              <div className="flex gap-2 justify-center py-2">
                                <input
                                  type="text"
                                  placeholder="OTP"
                                  maxLength={4}
                                  value={driverOtp}
                                  onChange={(e) => setDriverOtp(e.target.value.replace(/\D/g, ''))}
                                  className="w-full text-center bg-gray-50 border border-gray-200 h-14 rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none font-black text-2xl tracking-widest text-primary transition-all"
                                />
                              </div>
                              {driverOtpError && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wide">{driverOtpError}</p>}
                              <button onClick={handleVerifyDriverOtp} className="w-full bg-accent text-primary h-14 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-accent/20">
                                Verify & Start Ride
                              </button>
                              {activeRide.raw?.otp && (
                                <p className="text-gray-400 text-xs text-center mt-2 animate-pulse">[Hint from DB: {activeRide.raw.otp}]</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!incomingRide && !activeRide && (
                    <motion.div key="idle" className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <LayoutDashboard size={40} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">No Active Bookings</p>
                        <p className="text-sm">{isOnline ? "Searching for rides nearby..." : "Go online to start earning"}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {activeTab === 'wallet' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-primary p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                  <p className="text-[10px] font-black text-accent uppercase tracking-[4px] mb-2">Available Balance</p>
                  <h2 className="text-4xl font-black tracking-tight mb-8"><Currency amount={walletBalance} iconSize={28} /></h2>
                  <button className="w-full bg-accent text-primary h-14 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent/20">Withdraw Payout</button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest">Recent Payouts</h3>
                  {[
                    { id: 'PO-9921', amount: 3200, date: 'Oct 12, 2023', status: 'Completed' },
                    { id: 'PO-9918', amount: 1540, date: 'Oct 05, 2023', status: 'Completed' },
                    { id: 'PO-9872', amount: 5000, date: 'Sep 28, 2023', status: 'Completed' },
                  ].map((payout) => (
                    <div key={payout.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center hover:scale-[1.02] transition-transform cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm">{payout.id}</p>
                          <p className="text-[10px] font-bold text-gray-400">{payout.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary"><Currency amount={payout.amount} iconSize={14} /></p>
                        <p className="text-[8px] font-black uppercase text-green-500 tracking-widest">{payout.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'earnings' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                  {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setEarningsView(view)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${earningsView === view ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'}`}
                    >
                      {view}
                    </button>
                  ))}
                </div>

                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{earningsView} Performance</p>
                  <h2 className="text-4xl font-black text-primary mb-4"><Currency amount={earningsView === 'daily' ? 1240 : earningsView === 'weekly' ? 8450 : 32100} iconSize={28} /></h2>
                  <div className="flex justify-center gap-2 items-center text-green-500">
                    <Star size={12} className="fill-green-500" />
                    <span className="text-xs font-black">+12.4% vs last {earningsView === 'daily' ? 'day' : earningsView === 'weekly' ? 'week' : 'month'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Trips</p>
                    <p className="text-2xl font-black text-primary">{earningsView === 'daily' ? 8 : earningsView === 'weekly' ? 42 : 156}</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Online Hrs</p>
                    <p className="text-2xl font-black text-primary">{earningsView === 'daily' ? '6.5' : earningsView === 'weekly' ? '38' : '142'}</p>
                  </div>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Rating Breakdown</h3>
                  {[
                    { label: '5 Star', count: 142, color: 'bg-green-500' },
                    { label: '4 Star', count: 12, color: 'bg-green-400' },
                    { label: '3 Star', count: 2, color: 'bg-yellow-400' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-4 mb-3 last:mb-0">
                      <span className="text-[10px] font-bold text-gray-400 w-10">{row.label}</span>
                      <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${row.color}`} style={{ width: `${(row.count / 156) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-primary">{row.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-accent/20 text-primary rounded-full flex items-center justify-center">
                      <UserIcon size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-primary uppercase tracking-tight">Driver Profile</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Update your details</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                      <input
                        type="text"
                        value={driverProfileName}
                        onChange={(e) => setDriverProfileName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-4 text-primary font-bold outline-none transition-colors shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Vehicle Number</label>
                      <input
                        type="text"
                        value={driverVehicleNum}
                        onChange={(e) => setDriverVehicleNum(e.target.value)}
                        placeholder="e.g. TN 01 AB 1234"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-4 text-primary font-bold outline-none transition-colors uppercase tracking-widest shadow-inner"
                      />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                      className="w-full bg-accent text-primary h-14 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          <div className="grid grid-cols-4 gap-2 pt-6 border-t border-gray-50 mt-4">
            {[
              { icon: LayoutDashboard, label: "Home", active: true },
              { icon: Wallet, label: "Wallet" },
              { icon: Bell, label: "Alerts" },
              { icon: Settings, label: "Profile" }
            ].map((item, idx) => (
              <button key={idx} className="flex flex-col items-center gap-1.5 py-2 group">
                <item.icon size={20} className={item.active ? "text-accent" : "text-gray-300 group-hover:text-primary transition-colors"} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${item.active ? "text-primary" : "text-gray-300"}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : userRole === 'admin' ? (
        <div className="w-full md:w-[420px] bg-primary h-[65vh] md:h-full z-10 shadow-2xl flex flex-col relative md:rounded-l-[40px] mt-[-40px] md:mt-0 pt-12 pb-10 px-8 transition-all duration-500 overflow-hidden text-white">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Weefly <span className="text-accent">Admin</span></h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px] mt-2">Enterprise Access Connected</p>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
              <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center rotate-6 shadow-xl shadow-accent/20">
                <LayoutDashboard className="text-primary -rotate-6" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">System Dashboard</h3>
                <p className="text-white/40 text-sm mt-2">Manage drivers, pricing, and monitor real-time platform activity.</p>
              </div>
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full bg-accent text-primary h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
              >
                Open Admin Dashboard →
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[4px]">Quick Stats</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                  <p className="text-[10px] font-bold text-white/40 uppercase">Rides</p>
                  <p className="text-xl font-black">2.4k</p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                  <p className="text-[10px] font-bold text-white/40 uppercase">Revenue</p>
                  <p className="text-xl font-black"><Currency amount={1200000} iconSize={18} /></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Customer Dashboard */
        <div className="w-full md:w-[420px] bg-white h-[65vh] md:h-full z-10 shadow-2xl flex flex-col relative md:rounded-l-[40px] mt-[-40px] md:mt-0 pt-8 pb-10 px-6 transition-all duration-500 overflow-hidden">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
            <AnimatePresence mode="wait">
              {bookingStep === 0 && (
                <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-primary tracking-tight italic">Wee<span className="text-accent">fly</span> Cab</h1>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Premium Mobility Tamil Nadu</p>
                    </div>

                    <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-1">
                      <button
                        onClick={() => setRideType("instant")}
                        className={`flex-grow py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${rideType === "instant" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Instant Ride
                      </button>
                      <button
                        onClick={() => setRideType("schedule")}
                        className={`flex-grow py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${rideType === "schedule" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Schedule
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white" />
                          <div className="w-0.5 h-8 bg-gray-100" />
                        </div>
                        <input
                          type="text" placeholder="Pick up point" value={pickup}
                          onChange={(e) => {
                            setPickup(e.target.value);
                            setShowSuggestionsFor('pickup');
                          }}
                          onFocus={() => setShowSuggestionsFor('pickup')}
                          onBlur={() => setTimeout(() => setShowSuggestionsFor(null), 200)}
                          onKeyDown={(e) => handleKeyDown(e, 'pickup')}
                          className="w-full bg-gray-50 border border-gray-100 h-16 pl-12 pr-4 rounded-2xl focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none font-bold text-primary transition-all"
                        />
                        {showSuggestionsFor === 'pickup' && (
                          <SuggestionsDropdown
                            suggestions={suggestions.pickup}
                            isLoading={isSearchingLoc.pickup}
                            activeIndex={activeSuggestionIndex}
                            onSelect={(s) => handleSuggestionSelect(s, 'pickup')}
                            query={pickup}
                          />
                        )}
                      </div>

                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-accent rounded-sm" />
                        </div>
                        <input
                          type="text" placeholder="Where to?" value={destination}
                          onChange={(e) => {
                            setDestination(e.target.value);
                            setShowSuggestionsFor('destination');
                          }}
                          onFocus={() => setShowSuggestionsFor('destination')}
                          onBlur={() => setTimeout(() => setShowSuggestionsFor(null), 200)}
                          onKeyDown={(e) => handleKeyDown(e, 'destination')}
                          className="w-full bg-gray-50 border border-gray-100 h-16 pl-12 pr-4 rounded-2xl focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none font-bold text-primary transition-all"
                        />
                        {showSuggestionsFor === 'destination' && (
                          <SuggestionsDropdown
                            suggestions={suggestions.destination}
                            isLoading={isSearchingLoc.destination}
                            activeIndex={activeSuggestionIndex}
                            onSelect={(s) => handleSuggestionSelect(s, 'destination')}
                            query={destination}
                          />
                        )}
                      </div>

                      {rideType === "schedule" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 h-16 pl-12 pr-4 rounded-2xl focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none font-bold text-primary transition-all"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{error}</p>}

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">Suggestions</h3>
                    {["Salem Junction", "Omalur", "Marina Beach", "Chennai Central", "Pondicherry White Town"].map(loc => (
                      <button key={loc} onClick={() => setDestination(loc)} className="w-full flex items-center gap-4 py-3 hover:px-2 hover:bg-gray-50 rounded-xl transition-all group">
                        <Clock size={16} className="text-gray-300 group-hover:text-accent" />
                        <span className="text-sm font-bold text-primary/70">{loc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {bookingStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <button onClick={() => setBookingStep(0)} className="text-accent text-xs font-bold uppercase tracking-widest">← Change Destination</button>
                  <h2 className="text-2xl font-bold">Choose a ride</h2>
                  <div className="space-y-3">
                    {vehicles.map((v, idx) => {
                      const estimatedFare = fareData?.fares?.find((f: any) => f.id === v.id);
                      return (
                        <button
                          key={v.id} onClick={() => setSelectedVehicle(idx)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedVehicle === idx ? 'border-accent bg-accent/5 ring-4 ring-accent/5' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                        >
                          <div className={`p-3 rounded-xl ${selectedVehicle === idx ? 'bg-accent text-primary' : 'bg-gray-100 text-gray-400'}`}>
                            <v.icon size={24} />
                          </div>
                          <div className="flex-grow text-left">
                            <div className="flex justify-between items-center">
                              <p className="font-bold text-primary">{v.name}</p>
                              <p className="font-bold text-xl"><Currency amount={estimatedFare ? estimatedFare.surgeFare : v.basePrice} iconSize={16} /></p>
                            </div>
                            <p className="text-xs text-gray-500">{estimatedFare?.time || v.time} away • {v.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {fareData?.multiplier > 1.1 && (
                    <div className="bg-primary text-white p-4 rounded-2xl flex gap-3 items-center">
                      <div className="p-2 bg-accent rounded-lg text-primary"><ShieldCheck size={18} /></div>
                      <div className="text-xs">
                        <p className="font-bold text-accent">AI Surge Pricing Active</p>
                        <p className="opacity-70">High demand in Tamil Nadu. Gemini dynamically computed the fairest fare.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {bookingStep === 2 && (
                <motion.div key="step2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-8 pt-10">
                  <div className="relative">
                    <div className="w-32 h-32 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Searching for a driver...</h3>
                    <p className="text-gray-500 mt-2">Connecting you with the nearest captain in your area.</p>
                  </div>
                  <button onClick={() => setBookingStep(1)} className="text-red-500 font-bold text-sm uppercase tracking-widest border border-red-100 px-6 py-2 rounded-full hover:bg-red-50 transition-colors">Cancel Request</button>
                </motion.div>
              )}

              {bookingStep === 3 && assignedRide && (
                <motion.div key="step3" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100 italic font-black text-2xl">W</div>
                    <h3 className="text-2xl font-bold">Ride Confirmed!</h3>
                    <p className="text-gray-500">Your driver is arriving in 3 mins</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-[30px] space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"><UserIcon className="text-gray-400" size={24} /></div>
                        <div>
                          <p className="font-bold text-primary">{assignedRide.driver.name}</p>
                          <div className="flex items-center gap-1 text-[10px] bg-white px-2 py-0.5 rounded-full border border-gray-100 w-fit">
                            <Star size={10} className="fill-accent text-accent" /><span className="font-bold">{assignedRide.driver.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Plate</p>
                        <p className="font-black text-primary bg-accent/20 px-3 py-1 rounded-lg border border-accent/20">{assignedRide.driver.vehicleNumber}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-between gap-2">
                      <button className="flex-grow bg-white border border-gray-100 h-12 rounded-xl font-bold text-primary shadow-sm hover:bg-gray-50 transition-colors">Call Driver</button>
                      <button className="flex-grow bg-white border border-gray-100 h-12 rounded-xl font-bold text-primary shadow-sm hover:bg-gray-50 transition-colors">Message</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setBookingStep(4);
                        setTrackProgress(0); // Reset for the actual ride
                      }}
                      className="w-full bg-accent text-primary h-14 rounded-2xl font-bold hover:brightness-110 shadow-lg shadow-accent/20 transition-all"
                    >
                      Start Ride (Live Tracking) →
                    </button>
                    <button onClick={() => setBookingStep(0)} className="w-full bg-red-50 text-red-500 h-14 rounded-2xl font-bold hover:bg-red-100 transition-colors">Cancel Ride</button>
                  </div>
                </motion.div>
              )}

              {bookingStep === 4 && assignedRide && (
                <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="bg-primary/5 p-6 rounded-[32px] border border-accent/10">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-[10px] font-black text-accent uppercase tracking-[2px]">On the way</p>
                        <h3 className="text-2xl font-bold text-primary">Heading to {destination}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">{100 - trackProgress}%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Remaining</p>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${trackProgress}%` }} className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-yellow-400" />
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Share OTP with Captain:</span>
                        <span className="text-xl font-black tracking-[6px] text-primary bg-gray-100 px-3 py-1 rounded-lg">{assignedRide?.otp || '5521'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                          <UserIcon className="text-gray-400" size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-primary text-lg">{assignedRide.driver.name}</p>
                          <p className="text-sm text-gray-400 font-medium">{assignedRide.driver.vehicleNumber} • Blue {vehicles[selectedVehicle].name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-[32px] flex justify-around">
                    <button className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-accent group-hover:text-primary transition-all">
                        <Phone size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Call</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-accent group-hover:text-primary transition-all">
                        <Zap size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Share</span>
                    </button>
                    <button onClick={handleSOS} className={`flex flex-col items-center gap-2 group ${sosActive ? 'animate-pulse' : ''}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${sosActive ? 'bg-red-500 text-white' : 'bg-white group-hover:bg-red-500 group-hover:text-white'}`}>
                        <AlertTriangle size={20} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${sosActive ? 'text-red-500' : 'text-gray-400'}`}>SOS</span>
                    </button>
                  </div>
                  {trackProgress === 100 && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 bg-green-500 rounded-[32px] text-center text-white shadow-xl shadow-green-200">
                      <h4 className="text-xl font-bold mb-1">Arrived!</h4>
                      <p className="text-sm opacity-90 mb-4">Hope you enjoyed your luxury ride with Weefly.</p>
                      <button onClick={() => { setShowRating(true); }} className="bg-white text-green-600 px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">Complete & Rate</button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div >

          {(bookingStep < 2) && (
            <div className="pt-6 border-t border-gray-50 mt-4">
              <button
                disabled={isLoading || (bookingStep === 0 && (!pickup || !destination))}
                onClick={bookingStep === 0 ? getFares : requestRide}
                className="w-full bg-primary text-white h-16 rounded-[22px] font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                  <>
                    {bookingStep === 0 ? (
                      rideType === 'schedule' ? "Schedule Ride" : "Book Now"
                    ) : (
                      <>Complete Booking (<Currency amount={fareData?.fares?.[selectedVehicle]?.surgeFare || vehicles[selectedVehicle]?.basePrice || 150} iconSize={14} />)</>
                    )}
                    <ChevronRight size={20} className="text-accent" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Login Overlay */}
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-end md:items-center justify-center p-4">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><X size={20} /></button>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-xl shadow-accent/20">
                  <Phone className="text-primary -rotate-6" size={32} />
                </div>
                <h2 className="text-2xl font-bold">{authMode === 'login' ? "Welcome Back" : "Join Weefly"}</h2>
                <p className="text-gray-500 mt-2">{authMode === 'login' ? "Log in with your email and password" : "Create an account to get started"}</p>
              </div>
              <div className="space-y-4">
                {authMode === 'register' && (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border-none h-16 px-6 rounded-2xl focus:ring-4 focus:ring-accent/10 outline-none font-bold text-lg"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border-none h-16 px-6 rounded-2xl focus:ring-4 focus:ring-accent/10 outline-none font-bold text-lg"
                    />
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none h-16 px-6 rounded-2xl focus:ring-4 focus:ring-accent/10 outline-none font-bold text-lg"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-gray-50 border-none h-16 px-6 rounded-2xl focus:ring-4 focus:ring-accent/10 outline-none font-bold text-lg"
                />

                <button
                  disabled={isLoading}
                  onClick={handleLogin}
                  className="w-full bg-primary text-white h-16 rounded-2xl font-bold text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : (authMode === 'login' ? 'Login' : 'Sign Up')}
                </button>

                <div className="pt-4 text-center">
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setError(null);
                    }}
                    className="text-gray-500 hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                  </button>
                </div>

                {error && <p className="text-red-400 text-xs text-center font-bold mt-2 uppercase tracking-wide">{error}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Rate Captain Modal */}
      {
        showRating && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] p-10 w-full max-w-sm text-center shadow-2xl relative">
              <h2 className="text-2xl font-black text-primary mb-2">Rate your Ride</h2>
              <p className="text-gray-500 text-sm mb-6 font-bold">How was your trip with {assignedRide?.driver?.name}?</p>
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRatingVal(star)}
                    className={`transition-transform hover:scale-110 ${ratingVal >= star ? 'text-accent' : 'text-gray-200'}`}
                  >
                    <Star size={40} className={ratingVal >= star ? "fill-accent" : ""} />
                  </button>
                ))}
              </div>
              <textarea placeholder="Leave a compliment..." className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold mb-6 focus:ring-4 focus:ring-accent/10 outline-none" rows={3}></textarea>
              <button
                onClick={() => {
                  showToast("Thanks for your feedback!", "success");
                  setShowRating(false);
                  setBookingStep(0);
                  setTrackProgress(0);
                  setAssignedRide(null);
                }}
                className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                Submit Feedback
              </button>
            </motion.div>
          </div>
        )
      }

      {/* Customer Trip History Modal */}
      {
        showHistory && userRole === 'customer' && (
          <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowHistory(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 cursor-pointer"><X size={20} /></button>
              <h2 className="text-2xl font-black text-primary mb-6">Trip History</h2>
              <div className="space-y-4">
                {[
                  { date: 'Today, 2:30 PM', dest: 'Chennai Airport', fare: 450, status: 'Completed' },
                  { date: 'Yesterday, 9:15 AM', dest: 'Tidel Park', fare: 320, status: 'Completed' },
                  { date: '12 Feb, 6:00 PM', dest: 'Marina Mall', fare: 210, status: 'Cancelled' }
                ].map((trip, idx) => (
                  <div key={idx} className="p-4 border-2 border-gray-50 rounded-2xl hover:border-accent transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-primary">{trip.dest}</p>
                      <p className="font-black text-lg"><Currency amount={trip.fare || 0} iconSize={16} /></p>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <p className="text-gray-400 font-bold">{trip.date}</p>
                      <div className="flex items-center gap-2">
                        <span className={`font-black uppercase tracking-widest ${trip.status === 'Completed' ? 'text-green-500' : 'text-red-400'}`}>{trip.status}</span>
                        {trip.status === 'Completed' && (
                          <button onClick={() => showToast("Invoice Downloading...", "success")} className="flex items-center gap-1 text-primary bg-accent/20 px-2 py-1 rounded-lg hover:bg-accent/40 transition-colors cursor-pointer">
                            <FileText size={14} /> Download Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )
      }

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[200] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/20 pointer-events-auto ${toast.type === 'success' ? 'bg-green-500/95 text-white' : 'bg-primary/95 text-white'
                }`}
            >
              {toast.type === 'success' ? <ShieldCheck size={20} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-accent" />}
              <p className="font-bold text-sm tracking-wide">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main >
  );
}
