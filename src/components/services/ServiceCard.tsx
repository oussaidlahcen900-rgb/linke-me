"use client";

import { MapPin, Phone, Star } from "lucide-react";

interface ServiceProps {
    id: string;
    name: string; // Business/Person Name
    category: string;
    description: string;
    location: string;
    phone?: string;
    rating?: number;
    image?: string;
}

export default function ServiceCard({ service }: { service: ServiceProps }) {
    return (
        <div className="card hover:border-blue-200 cursor-pointer group mb-4 flex gap-4">
            {/* Image */}
            <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                {service.image ? (
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-50">
                        {service.name.substring(0, 1)}
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                            {service.name}
                        </h3>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {service.category}
                        </span>
                    </div>
                    {service.rating && (
                        <div className="flex items-center gap-1 text-amber-500 font-medium text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            {service.rating}
                        </div>
                    )}
                </div>

                <p className="text-slate-600 text-sm mt-2 line-clamp-2">{service.description}</p>

                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {service.location}
                    </div>
                    {service.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {service.phone}
                        </div>
                    )}

                    <button className="ml-auto text-blue-600 font-medium hover:underline text-sm">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    );
}
