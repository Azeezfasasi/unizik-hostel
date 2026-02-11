'use client';

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Commet } from "react-loading-indicators";

export default function WhyChooseUs() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/whychooseus');
      const result = await response.json();
      if (result.success) {
        setFeatures(result.data);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      // Fallback to default features if API fails
      setFeatures([
        {
          title: "Faith-Centered Community",
          description: "We are a faith-based organization dedicated to strengthening spiritual bonds and values rooted in Christian principles among Nigerian-American families.",
        },
        {
          title: "Cultural Heritage & Identity",
          description: "We celebrate and preserve Nigerian cultural traditions while fostering pride in our heritage and promoting positive integration in American society.",
        },
        {
          title: "Networking & Support",
          description: "We provide meaningful connections and support networks for Nigerian-Americans to advance professionally, educationally, and socially.",
        },
        {
          title: "Community Impact",
          description: "We are committed to charitable outreach and humanitarian efforts that uplift both the Nigerian-American community and those in need worldwide.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Why Choose CANAN USA
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We unite Nigerian-Americans through faith, culture, and community—empowering our members to thrive spiritually, professionally, and socially.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.length > 0 ? (
            features.map((feature) => (
              <div
                key={feature._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 text-center"
              >
                <CheckCircle className="mx-auto text-blue-900 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No features available.</p>
          )}
        </div>
      </div>
    </section>
  );
}
