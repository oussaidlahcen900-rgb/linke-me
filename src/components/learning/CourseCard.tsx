"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface CourseProps {
    id: string;
    title: string;
    provider: string; // Institution or Instructor
    description: string;
    location: string; // Online or Address
    date?: string;
    duration?: string;
    price?: string;
}

export default function CourseCard({ course }: { course: CourseProps }) {
    return (
        <div className="card hover:border-blue-200 cursor-pointer group mb-4">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">{course.title}</h3>
                {course.price && (
                    <span className="text-sm font-semibold text-white bg-blue-500 px-2 py-1 rounded-md">
                        {course.price}
                    </span>
                )}
            </div>
            <p className="text-slate-600 font-medium text-sm mb-2">{course.provider}</p>

            <p className="text-slate-600 text-sm line-clamp-2 mb-3">{course.description}</p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {course.location}
                </div>
                {course.date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {course.date}
                    </div>
                )}
                {course.duration && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {course.duration}
                    </div>
                )}
            </div>
        </div>
    );
}
