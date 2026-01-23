"use client";

import { MapPin, Briefcase, Clock, Building } from "lucide-react";

interface JobProps {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string; // Full-time, Part-time, etc.
    salary: string;
    postedAt: string;
    logo?: string;
}

export default function JobCard({ job }: { job: JobProps }) {
    return (
        <div className="card hover:border-blue-200 cursor-pointer group mb-4">
            <div className="flex gap-4">
                {/* Company Logo / Placeholder */}
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                    {job.logo ? (
                        <img src={job.logo} alt={job.company} className="w-10 h-10 object-contain" />
                    ) : (
                        <Building className="w-8 h-8 text-slate-400" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                                {job.title}
                            </h3>
                            <p className="text-slate-600 font-medium">{job.company}</p>
                        </div>
                        {job.salary && (
                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                {job.salary}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {job.type}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {job.postedAt}
                        </div>
                    </div>
                </div>

                <div className="mt-1">
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
