"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Commet } from "react-loading-indicators";

const defaultOverview = {
  whoWeAre: {
    title: "Who We Are",
    paragraphs: [
      "The Christian Association of Nigerian-Americans (CANAN USA) is a national Christian advocacy organization dedicated to defending religious freedom, protecting persecuted Christians, and strengthening Nigerian-American communities across the United States.",
      "We collaborate with churches, civic leaders, human rights organizations, and U.S. policymakers to ensure that the cry of persecuted believers is heard, addressed, and acted upon."
    ]
  },
  vision: {
    title: "Our Vision",
    description: "A world where Nigerian Christians live in safety, dignity, and freedom and where Nigerian Americans thrive as a united, empowered Christian community in the U.S."
  },
  mission: {
    title: "Our Mission",
    description: "To mobilize Christians, influence policy, and provide humanitarian support to protect persecuted Christians in Nigeria and uplift Nigerian American communities."
  },
  coreValues: {
    title: "Our Core Values",
    values: [
      {
        name: "Faith & Spirituality",
        description: "Rooted in Christian principles and values that guide our mission.",
        colorClass: "blue-900"
      },
      {
        name: "Justice & Advocacy",
        description: "Defending religious freedom and protecting persecuted believers.",
        colorClass: "amber-600"
      },
      {
        name: "Community & Unity",
        description: "Strengthening bonds among Nigerian-Americans and building collective strength.",
        colorClass: "green-700"
      },
      {
        name: "Compassion & Humanity",
        description: "Supporting and uplifting vulnerable Christians with humanitarian aid.",
        colorClass: "red-600"
      },
      {
        name: "Empowerment",
        description: "Enabling Nigerian-Americans to thrive professionally, socially, and spiritually.",
        colorClass: "purple-600"
      }
    ]
  },
  image: {
    url: "/images/placeholder.png",
    alt: "CANAN USA Overview"
  }
};

export default function CompanyOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/company-overview");
        const result = await res.json();
        if (result.success && result.data) {
          setOverview(result.data);
        } else {
          setOverview(defaultOverview);
        }
      } catch (err) {
        console.error("Failed to fetch company overview:", err);
        setOverview(defaultOverview);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
        </div>
      </section>
    );
  }

  const data = overview || defaultOverview;
  return (
    <>
      {/* Company Overview Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={data.image?.url || "/images/placeholder.png"}
                  alt={data.image?.alt || "Company Overview"}
                  fill
                  sizes="100%"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {data.whoWeAre?.title || "Who We Are"}
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {data.whoWeAre?.paragraphs?.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              {data.vision?.title || "Our Vision"}
            </h2>
            <div className="bg-white rounded-lg shadow-md p-8 md:p-12 border-l-4 border-blue-900">
              <p className="text-xl text-gray-700 leading-relaxed">
                {data.vision?.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              {data.mission?.title || "Our Mission"}
            </h2>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-md p-8 md:p-12 border-l-4 border-blue-900">
              <p className="text-xl text-gray-700 leading-relaxed">
                {data.mission?.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            {data.coreValues?.title || "Our Core Values"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {data.coreValues?.values?.map((value, idx) => {
              const bgColorMap = {
                "blue-900": "bg-blue-900",
                "amber-600": "bg-amber-600",
                "green-700": "bg-green-700",
                "red-600": "bg-red-600",
                "purple-600": "bg-purple-600"
              };

              const bgColor = bgColorMap[value.colorClass] || "bg-blue-900";

              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {value.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
