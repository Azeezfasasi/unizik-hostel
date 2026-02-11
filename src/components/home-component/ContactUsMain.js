"use client";
import { useState, useEffect } from "react";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Clock } from "lucide-react";
import MapPreview from "@/components/MapPreview";
import { Commet } from "react-loading-indicators";

export default function ContactUsMain() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactDetails, setContactDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch contact details
  useEffect(() => {
    fetchContactDetails();
  }, []);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contactdetails');
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setContactDetails(result.data[0]);
      } else {
        // Fallback to default values
        setContactDetails({
          phone: "(+1) 234-567-890",
          whatsapp: "(+1) 234-567-890",
          email: "info@unizikhostel.org",
          location: "Nigeria",
          latitude: 31.9686,
          longitude: -99.9018,
          businessHours: "Mon - Fri: 8:00 AM - 5:00 PM",
          facebookUrl: "https://facebook.com",
          linkedinUrl: "https://linkedin.com",
          instagramUrl: "https://instagram.com"
        });
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      // Fallback to default values
      setContactDetails({
        phone: "(+1) 234-567-890",
        whatsapp: "(+1) 234-567-890",
        email: "info@unizikhostel.org",
        location: "Nigeria",
        latitude: 31.9686,
        longitude: -99.9018,
        businessHours: "Mon - Fri: 8:00 AM - 5:00 PM",
        facebookUrl: "https://facebook.com",
        linkedinUrl: "https://linkedin.com",
        instagramUrl: "https://instagram.com"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Thank you! Your message has been submitted.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert(data.message || "Failed to submit message.");
      }
    } catch (error) {
      alert("Failed to submit message.");
      console.error("Contact form error:", error);
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-16" id="contact">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center">
            <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16" id="contact">
      <div className="container mx-auto px-6 lg:px-20">

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Us a Message</h2>
              <div className="grid gap-6">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Your Message"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-800 transition cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Location / Map */}
            {contactDetails?.latitude && contactDetails?.longitude && (
              <MapPreview
                latitude={contactDetails.latitude}
                longitude={contactDetails.longitude}
                locationName={contactDetails.location}
              />
            )}

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-900" />
                <p>{contactDetails?.location || "Location not available"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-blue-900" />
                <a href={`tel:${contactDetails?.phone}`} className="hover:text-blue-900 transition">
                  {contactDetails?.phone || "Phone not available"}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#1c398e"></path> <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#1c398e"></path> </g></svg>
                <a href={`https://wa.me/${contactDetails?.whatsapp?.replace(/\D/g, '')}`} className="hover:text-blue-700 transition">
                  {contactDetails?.whatsapp || "WhatsApp not available"}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-blue-900" />
                <a href={`mailto:${contactDetails?.email}`} className="hover:text-blue-900 transition">
                  {contactDetails?.email || "Email not available"}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-blue-900" />
                <p>{contactDetails?.businessHours || "Hours not available"}</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              {contactDetails?.facebookUrl && (
                <a href={contactDetails.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-900 transition">
                  <Facebook size={24} />
                </a>
              )}
              {contactDetails?.linkedinUrl && (
                <a href={contactDetails.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-900 transition">
                  <Linkedin size={24} />
                </a>
              )}
              {contactDetails?.instagramUrl && (
                <a href={contactDetails.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-900 transition">
                  <Instagram size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
