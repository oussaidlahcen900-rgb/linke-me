"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Link2, MapPin, Users, Briefcase } from "lucide-react";

export default function PromoCard() {
    return (
        <div id="promo-card" className="w-[400px] h-[500px] bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col text-white">

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            {/* Header / Logo Area */}
            <div className="p-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transform -rotate-6 shadow-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Linke-Me</h1>
                </div>
                <p className="text-blue-200 font-medium tracking-wide text-sm uppercase">Your Local Community Hub</p>
            </div>

            {/* Core Content */}
            <div className="flex-1 px-8 flex flex-col items-center relative z-10">
                <h2 className="text-2xl font-bold text-center mb-6 leading-tight">
                    Connect Locally.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Grow Globally.</span>
                </h2>

                <div className="w-full space-y-3 mb-8">
                    <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-200" />
                        </div>
                        <div className="text-sm font-medium">Connect with Neighbors</div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Briefcase className="w-5 h-5 text-purple-200" />
                        </div>
                        <div className="text-sm font-medium">Find Local Jobs & Services</div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="bg-white p-3 rounded-2xl shadow-xl transform hover:scale-105 transition duration-300">
                    <QRCodeCanvas
                        value="https://linke-me.vercel.app"
                        size={100}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                            src: "",
                            x: undefined,
                            y: undefined,
                            height: 24,
                            width: 24,
                            excavate: true,
                        }}
                    />
                </div>
                <p className="mt-4 text-xs font-medium text-blue-200 flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> linke-me.vercel.app
                </p>
            </div>

            {/* Footer Strip */}
            <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 w-full mt-auto" />
        </div>
    );
}
