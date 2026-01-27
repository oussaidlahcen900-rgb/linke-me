
import { Service } from "@/types";
import { MapPin, Phone, User, Tag, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ServiceCard({ service }: { service: Service }) {
    const timeAgo = service.postedAt?.toDate
        ? formatDistanceToNow(service.postedAt.toDate(), { addSuffix: true })
        : "Recently";

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover-bounce transition">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">{service.title}</h3>
                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{service.providerName}</span>
                    </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {service.category}
                </span>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                </div>
                <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <Tag className="w-4 h-4" />
                    {service.price}
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {timeAgo}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                    {service.description}
                </p>
                <div className="flex gap-2">
                    <button
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                        onClick={() => window.open(`https://wa.me/${service.contactPhone.replace(/\D/g, '')}`, '_blank')}
                    >
                        <Phone className="w-4 h-4" />
                        WhatsApp
                    </button>
                    <button
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                        onClick={() => window.location.href = `tel:${service.contactPhone}`}
                    >
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
}
