"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Users, FileText, Trash2, Shield, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [postsCount, setPostsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch Users
            const usersSnap = await getDocs(collection(db, "users"));
            setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            // Fetch Posts Count (not efficient for large DBs, but fine for now)
            const postsSnap = await getDocs(collection(db, "posts"));
            setPostsCount(postsSnap.size);

            setLoading(false);
        } catch (error) {
            console.error("Admin fetch error:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const makeAdmin = async (userId: string) => {
        if (confirm("Promote this user to Admin?")) {
            await updateDoc(doc(db, "users", userId), { role: "admin" });
            fetchData(); // Refresh
        }
    };

    const deleteUser = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
            await deleteDoc(doc(db, "users", userId));
            // Ideally delete their posts too
            fetchData();
        }
    };

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><FileText className="w-6 h-6" /></div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Posts</p>
                        <h3 className="text-2xl font-bold text-slate-900">{postsCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Shield className="w-6 h-6" /></div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Admins</p>
                        <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === "admin").length}</h3>
                    </div>
                </div>
            </div>

            {/* User Management Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">City</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div>{user.displayName}</div>
                                        <div className="text-slate-400 text-xs">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.city}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {user.role !== 'admin' && (
                                            <button onClick={() => makeAdmin(user.id)} className="text-blue-600 hover:text-blue-800 p-1" title="Promote to Admin">
                                                <ShieldCheck className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete User">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
