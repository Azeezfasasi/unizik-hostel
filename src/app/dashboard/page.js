"use client";
import React from "react";
import DashboardStats from "@/components/dashboard-component/DashboardStats";
import DashboardWelcome from "@/components/dashboard-component/DashboardWelcome";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Commet } from "react-loading-indicators";
import CampusChart from "@/components/dashboard-component/CampusChart";
import HostelChart from "@/components/dashboard-component/HostelChart";

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
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center">
            <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
          </div>
        </div>
      </section>
    )
  }
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <DashboardWelcome />

      {user?.role === 'super admin' ? (
        <>
          <DashboardStats />
          {/* <MembershipStatusChart /> */}
          <CampusChart />
          <HostelChart />
        </>
      ) : null}
    </div>
  );
}
