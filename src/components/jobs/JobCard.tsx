import { Job } from "@/types";
import { MapPin, Building, Clock, DollarSign, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobCard({ job }: { job: Job }) {
    // Safe date formatting
    const timeAgo = job.postedAt?.toDate
        ? formatDistanceToNow(job.postedAt.toDate(), { addSuffix: true })
        : "Recently";

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                        <Building className="w-4 h-4" />
                        <span className="font-medium">{job.company}</span>
                    </div>
                </div>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {job.type}
                </span>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                </div>
                {job.salary && (
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {timeAgo}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <p className="text-slate-500 text-sm line-clamp-2 flex-1 mr-4">
                    {job.description}
                </p>
                <button
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
                    onClick={() => window.location.href = `mailto:?subject=Application for ${job.title}&body=I am interested in...`}
                >
                    Apply Now
                </button>
            </div>
        </div>
    );
}
