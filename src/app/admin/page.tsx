"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Trash2, Shield, ShieldCheck, ShieldAlert, Search, LayoutGrid, List, BarChart3, CheckCircle, Menu, X, Flag, MoreVertical, LogOut } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getStorageStats, getAllUsers, toggleBanUser, verifyUser, getAllPosts, deletePostAdmin, getReports, resolveReport } from "@/lib/adminUtils";
import { formatRelativeTime } from "@/lib/dateUtils";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'reports'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Data States
    const [storageUsage, setStorageUsage] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#E2E8F0'];

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        if (activeTab === 'overview') {
            const stats = await getStorageStats();
            setStorageUsage(stats);
        } else if (activeTab === 'users') {
            const u = await getAllUsers();
            setUsers(u);
        } else if (activeTab === 'content') {
            const p = await getAllPosts();
            setPosts(p);
        } else if (activeTab === 'reports') {
            const r = await getReports();
            setReports(r);
        }
        setLoading(false);
    };

    // Actions
    const handleBan = async (uid: string, currentStatus: boolean) => {
        if (confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) {
            await toggleBanUser(uid, currentStatus);
            loadData();
        }
    };

    const handleVerify = async (uid: string) => {
        await verifyUser(uid);
        loadData();
    };

    const handleDeletePost = async (postId: string) => {
        if (confirm("Delete this post permanently?")) {
            await deletePostAdmin(postId);
            loadData();
        }
    };

    const handleResolveReport = async (reportId: string) => {
        await resolveReport(reportId);
        loadData();
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 relative">
            {/* Sidebar */}
            <aside className={`
                fixed md:relative z-20 h-full bg-white border-r border-slate-200 transition-all duration-300
                ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className={`font-bold text-slate-800 transition-opacity ${!isSidebarOpen && 'md:hidden'}`}>Admin Panel</h2>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 rounded-lg">
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutGrid} label="Overview" expanded={isSidebarOpen} />
                    <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users" expanded={isSidebarOpen} />
                    <NavButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={FileText} label="Content" expanded={isSidebarOpen} />
                    <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={Flag} label="Reports" expanded={isSidebarOpen} />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h1>
                        <p className="text-slate-500">Manage your platform efficiently.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20 text-slate-400">Loading data...</div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <OverviewTab storageUsage={storageUsage} COLORS={COLORS} />
                        )}

                        {activeTab === 'users' && (
                            <UsersTab users={users} onBan={handleBan} onVerify={handleVerify} />
                        )}

                        {activeTab === 'content' && (
                            <ContentTab posts={posts} onDelete={handleDeletePost} />
                        )}

                        {activeTab === 'reports' && (
                            <ReportsTab reports={reports} onResolve={handleResolveReport} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// --- Sub-Components ---

function NavButton({ active, onClick, icon: Icon, label, expanded }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all
                ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-600 hover:bg-slate-100'}
            `}
            title={label}
        >
            <Icon className="w-5 h-5 min-w-[20px]" />
            <span className={`font-medium transition-opacity whitespace-nowrap ${!expanded && 'hidden md:hidden'}`}>{label}</span>
        </button>
    );
}

function OverviewTab({ storageUsage, COLORS }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Storage Monitor */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" /> Storage Usage
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={storageUsage} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                {storageUsage.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="ml-8 space-y-2">
                        {storageUsage.map((entry: any, index: number) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                <span className="text-sm text-slate-600">{entry.name}: {entry.value}MB</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Optimization</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-green-900">Image Compression</p>
                            <p className="text-xs text-green-700">Active (WebP / 80%)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UsersTab({ users, onBan, onVerify }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((u: any) => (
                        <tr key={u.uid} className="hover:bg-slate-50/50 transition">
                            <td className="p-4 flex items-center gap-3">
                                <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                                <div>
                                    <p className="font-medium text-slate-900">{u.displayName || 'Unknown'}</p>
                                    <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-slate-600 capitalize">{u.role || 'user'}</td>
                            <td className="p-4">
                                {u.isBanned ? (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Banned</span>
                                ) : u.isVerified ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>
                                ) : (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Active</span>
                                )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                                {!u.isVerified && (
                                    <button onClick={() => onVerify(u.uid)} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Verify</button>
                                )}
                                <button
                                    onClick={() => onBan(u.uid, u.isBanned)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg ${u.isBanned ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                >
                                    {u.isBanned ? 'Unban' : 'Ban'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ContentTab({ posts, onDelete }: any) {
    return (
        <div className="grid gap-4 animate-in fade-in">
            {posts.map((post: any) => (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-start justify-between shadow-sm">
                    <div className="flex gap-4">
                        {post.imageUrl && <img src={post.imageUrl} className="w-20 h-20 object-cover rounded-lg bg-slate-100" alt="" />}
                        <div>
                            <p className="font-medium text-slate-800 line-clamp-2">{post.text}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                <span>By {post.authorName || 'Unknown'}</span>
                                <span>•</span>
                                <span>{post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => onDelete(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Post">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

function ReportsTab({ reports, onResolve }: any) {
    if (reports.length === 0) return <div className="text-center py-20 text-slate-500">No reports found. Good job! 🎉</div>;

    return (
        <div className="space-y-4 animate-in fade-in">
            {reports.map((report: any) => (
                <div key={report.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <span className="font-bold text-slate-800">Reported Content</span>
                        </div>
                        <p className="text-sm text-slate-600">Post ID: <span className="font-mono text-xs bg-slate-100 px-1 rounded">{report.targetId}</span></p>
                        <p className="text-xs text-slate-400 mt-1">Reported by: {report.reporterId}</p>
                    </div>
                    <button onClick={() => onResolve(report.id)} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition">
                        Resolve / Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
}
