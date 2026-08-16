"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from "@/context/AuthContext";
import { ClipboardList, MessageSquareWarning, DoorOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { Commet } from "react-loading-indicators";

const ROLE_ACTIONS = {
  'super admin': [
    { href: '/dashboard/all-room-requests', label: 'Review Room Requests', icon: ClipboardList, primary: true },
    { href: '/dashboard/manage-complaints', label: 'Manage Complaints', icon: MessageSquareWarning },
  ],
  admin: [
    { href: '/dashboard/all-room-requests', label: 'Review Room Requests', icon: ClipboardList, primary: true },
    { href: '/dashboard/manage-complaints', label: 'Manage Complaints', icon: MessageSquareWarning },
  ],
  staff: [
    { href: '/dashboard/all-damage-reports', label: 'Damage Reports', icon: FileText, primary: true },
    { href: '/dashboard/manage-complaints', label: 'Manage Complaints', icon: MessageSquareWarning },
  ],
  student: [
    { href: '/dashboard/my-room-details', label: 'My Room Details', icon: DoorOpen, primary: true },
    { href: '/dashboard/send-complaint', label: 'Report an Issue', icon: MessageSquareWarning },
  ],
};

function getGreeting(date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardWelcome() {
  const { user, loading } = useAuth();
  const [now, setNow] = useState(null);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [greeting, setGreeting] = useState("");


  useEffect(() => {
    function updateTime() {
      const current = new Date();
      setNow(current);
      setGreeting(getGreeting(current));
      setDateStr(new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(current));
      setTimeStr(new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(current));
    }
    updateTime();
    const t = setInterval(updateTime, 60_000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center">
            <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
          </div>
        </div>
      </section>
    );
  }
  if (!user) {
    return (
      <section className="bg-white rounded-lg shadow-sm p-5 md:p-6 lg:p-8 text-center">
        <div className="text-red-600 font-semibold">You are not authorized. Please log in.</div>
      </section>
    );
  }

  // Get first name and role from user object
  const firstName = user?.firstName || (user?.name ? user.name.split(" ")[0] : "Admin");
  const role = user?.role || "";

  const actions = ROLE_ACTIONS[role] || [];

  return (
    <section className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 lg:p-8">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blue-900/5" aria-hidden="true" />
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-800 to-blue-900 text-white text-xl font-bold shadow-sm">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900 tracking-tight">
              {greeting}, <span className="text-blue-900">{firstName}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">{dateStr} • {timeStr}</p>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {actions.map(({ href, label, icon: Icon, primary }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  primary
                    ? 'bg-blue-900 text-white hover:bg-blue-800 shadow-sm'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
