"use client";

import { Info, TrendingUp } from "lucide-react";

export default function NewsWidget() {
    const news = [
        { title: "Tech jobs booming in City", time: "2h ago", readers: 450 },
        { title: "New remote work policies", time: "4h ago", readers: 1200 },
        { title: "Local business networking event", time: "1d ago", readers: 300 },
        { title: "Javascript maintainers needed", time: "1d ago", readers: 890 },
        { title: "Linke-Me launches new features", time: "Just now", readers: 5000 },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-4 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 text-sm">Linke-Me News</h3>
                <Info className="w-4 h-4 text-slate-700 fill-slate-700  rounded" />
            </div>

            <ul className="pb-2">
                {news.map((item, index) => (
                    <li key={index} className="px-4 py-2 hover:bg-slate-50 cursor-pointer transition">
                        <div className="flex items-start gap-2">
                            <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-500 flex-shrink-0"></div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{item.title}</h4>
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                    <span>{item.time}</span>
                                    <span>•</span>
                                    <span>{item.readers} readers</span>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <button className="w-full py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition text-center flex items-center justify-center gap-1">
                Show more <TrendingUp className="w-3 h-3" />
            </button>
        </div>
    );
}
