'use client'

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Commet } from "react-loading-indicators";

const defaultTestimonials = [
  {
    id: 1,
    name: "Chisom Obi",
    position: "Students",
    message:
      "Unizik Hostel has been a blessing to our community. Their dedication to providing safe and affordable housing for students and visitors is truly commendable. I've seen firsthand how they create a supportive environment that fosters growth and connection among residents.",
    rating: 5,
    isActive: true,
  },
  {
    id: 2,
    name: "Dr. Ngozi Uwazie",
    position: "Students",
    message:
      "The organization's commitment to education and empowerment is remarkable. I've witnessed firsthand how UNIZIK Hostel is making a real difference in the lives of Nigerian students and families across the country.",
    rating: 5,
    isActive: true,
  },
  {
    id: 3,
    name: "Pastor Emeka Nwosu",
    position: "Students",
    message:
      "UNIZIK Hostel is a shining example of how faith and community can come together to create positive change. Their dedication to providing safe and affordable housing for students and visitors is truly commendable.",
    rating: 5,
    isActive: true,
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonial");
        const result = await res.json();
        if (result.success && result.data) {
          setTestimonials(result.data);
        } else {
          setTestimonials(defaultTestimonials);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
        setTestimonials(defaultTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
        </div>
      </section>
    );
  }

  const data = testimonials || defaultTestimonials;

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            What Our Community Members Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from members, leaders, and partners who have experienced the impact of UNIZIK Hostel's housing and community initiatives.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.map((testimonial) => (
            <div
              key={testimonial._id || testimonial.id}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition"
            >
              {/* Stars */}
              <div className="flex gap-1 text-yellow-500 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              {/* Message */}
              <p className="text-gray-600 mb-6 italic">
                “{testimonial.message}”
              </p>

              {/* Author */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-gray-500">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/join-us"
            className="inline-block bg-green-700 text-white px-8 py-3 rounded-lg shadow hover:bg-green-800 transition"
          >
            Join Our Community
          </a>
        </div>
      </div>
    </section>
  );
}
