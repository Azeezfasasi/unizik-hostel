"use client";
import React from "react";
import DashboardStats from "@/components/dashboard-component/DashboardStats";
import DashboardWelcome from "@/components/dashboard-component/DashboardWelcome";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/dashboard-component/ui/Skeleton";
import CampusChart from "@/components/dashboard-component/CampusChart";
import HostelChart from "@/components/dashboard-component/HostelChart";
import Link from "next/link";
import {
  DoorOpen,
  ClipboardList,
  MessageSquareWarning,
  FileText,
  UserPen,
  Bell,
  Building2,
  Users,
} from "lucide-react";

const QUICK_LINKS = {
  staff: [
    { href: "/dashboard/all-room-requests", label: "Room Requests", desc: "Review pending bed assignments", icon: ClipboardList },
    { href: "/dashboard/manage-complaints", label: "Complaints", desc: "Track and resolve open tickets", icon: MessageSquareWarning },
    { href: "/dashboard/all-damage-reports", label: "Damage Reports", desc: "Facility repairs in progress", icon: FileText },
    { href: "/dashboard/occupancy", label: "Occupancy", desc: "Current allocations overview", icon: Building2 },
  ],
  student: [
    { href: "/dashboard/my-room-details", label: "My Room Details", desc: "View your room & download your card", icon: DoorOpen },
    { href: "/dashboard/request-a-room", label: "Request a Room", desc: "Pick a room and bed", icon: ClipboardList },
    { href: "/dashboard/send-complaint", label: "Report an Issue", desc: "Submit a complaint or damage report", icon: MessageSquareWarning },
    { href: "/dashboard/my-profile", label: "My Profile", desc: "Update your account details", icon: UserPen },
  ],
};

function QuickLinks({ role }) {
  const links = QUICK_LINKS[role] || [];
  if (links.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-900/5 text-blue-900 mb-4 group-hover:bg-blue-900 group-hover:text-white transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <PageSpinner label="Loading your dashboard..." />;
  }
  if (!isAuthenticated) {
    return null;
  }

  const isAdminTier = user?.role === "super admin" || user?.role === "admin";

  return (
    <div>
      <DashboardWelcome />

      {isAdminTier ? (
        <>
          <DashboardStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <CampusChart />
            <HostelChart />
          </div>
        </>
      ) : (
        <QuickLinks role={user?.role} />
      )}
    </div>
  );
}
