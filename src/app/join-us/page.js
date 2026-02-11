'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, CheckCircle, Mail, Phone, MapPin, Users, Heart, Target } from 'lucide-react';
import PageTitle from '@/components/home-component/PageTitle';

export default function JoinUs() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    
    // Step 2: Location & Background
    country: '',
    state: '',
    city: '',
    placeOfOrigin: '',
    
    // Step 3: Interests & Involvement
    membershipType: 'regular',
    interests: [],
    specialSkills: '',
    skills: '',
    
    // Step 4: Why Join
    motivation: '',
    howHeardAbout: '',
    
    // Step 5: Agreement
    agreeToTerms: false,
    agreeToContact: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const TOTAL_STEPS = 5;

  const MEMBERSHIP_TYPES = [
    { value: 'regular', label: 'Regular Member', description: 'Full access to events and community' },
    { value: 'student', label: 'Student', description: 'Special rates for students' },
    { value: 'corporate', label: 'Corporate Partner', description: 'Business partnership opportunities' },
  ];

  const INTERESTS = [
    'Religious Advocacy',
    'Cultural Events',
    'Youth Programs',
    'Education & Scholarship',
    'Humanitarian Aid',
    'Professional Networking',
    'Social Justice',
    'Community Service',
  ];

  const SPECIAL_SKILLS = [
    'Fundraising',
    'Social Media Marketing',
    'Community/Event Organizing',
    'Press/Media Campaign',
    'Training/Development',
    'Technical/Video/Photography and Editing.',
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (step === 2) {
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.state.trim()) newErrors.state = 'State/Province is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
    }

    if (step === 3) {
      if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
      // if (!formData.specialSkills) newErrors.specialSkills = 'Please select a special skill';
    }

    if (step === 4) {
      if (!formData.motivation.trim()) newErrors.motivation = 'Please tell us why you want to join';
      if (!formData.howHeardAbout.trim()) newErrors.howHeardAbout = 'Please let us know how you heard about us';
    }

    if (step === 5) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      try {
        setSubmitting(true);
        setSubmitError('');

        // Submit form data to backend API
        const response = await fetch('/api/joinus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmitted(true);
          window.scrollTo(0, 0);
        } else {
          setSubmitError(data.message || 'Error submitting form. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        setSubmitError('An error occurred while submitting your application. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Welcome to UNIZIK Hostel!
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for submitting your membership application. We have received your information and will review it shortly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <p className="text-gray-700 mb-3">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ We will review your application within 2-3 business days</li>
                <li>✓ You will receive a confirmation email at <span className="font-semibold text-gray-900">{formData.email}</span></li>
                <li>✓ Our team will contact you to discuss membership options and next steps</li>
                <li>✓ You will gain access to exclusive community events and resources</li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <PageTitle title="Join Us" subtitle="Join our community today!" />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Join UNIZIK Hostel
          </h1>
          <p className="text-gray-600 text-lg">
            Become part of our vibrant Nigerian-American Christian community
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                    step === currentStep
                      ? 'bg-blue-900 text-white scale-110'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 text-center font-medium">
                  {['Personal', 'Location', 'Interests', 'Motivation', 'Confirm'][step - 1]}
                </p>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-900 to-indigo-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <form onSubmit={currentStep === TOTAL_STEPS ? handleSubmit : undefined}>
            {/* Error Message Display */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Mail className="w-6 h-6 text-blue-900" />
                    Personal Information
                  </h2>
                  <p className="text-gray-600">Help us get to know you better</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select name='gender' id='gender' onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}>
                      <option value="">--Select Gender--</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Background */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-blue-900" />
                    Location & Background
                  </h2>
                  <p className="text-gray-600">Where are you located and where are you from?</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="United States"
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="California"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Los Angeles"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Place of Origin in Nigeria
                  </label>
                  <input
                    type="text"
                    name="placeOfOrigin"
                    value={formData.placeOfOrigin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition"
                    placeholder="e.g., Lagos, Ibadan, Enugu"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Interests & Involvement */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-blue-900" />
                    Your Interests & Involvement
                  </h2>
                  <p className="text-gray-600">What are you passionate about?</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Membership Type *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {MEMBERSHIP_TYPES.map(type => (
                      <label key={type.value} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                        <input
                          type="radio"
                          name="membershipType"
                          value={type.value}
                          checked={formData.membershipType === type.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-900"
                        />
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">{type.label}</p>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Areas of Interest *
                  </label>
                  {errors.interests && <p className="text-red-500 text-sm mb-2">{errors.interests}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INTERESTS.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-3 rounded-lg border-2 transition text-left font-medium ${
                          formData.interests.includes(interest)
                            ? 'border-blue-900 bg-blue-50 text-blue-900'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-900'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Volunteer Skills
                  </label>
                  <select
                    name="specialSkills"
                    value={formData.specialSkills}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                      errors.specialSkills ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select your special skills --</option>
                    {SPECIAL_SKILLS.map(skill => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  {errors.specialSkills && <p className="text-red-500 text-sm mt-1">{errors.specialSkills}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What skills can you offer?
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition"
                    placeholder="e.g., Marketing, Event Planning, Legal Expertise, Counseling..."
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Why Join */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="w-6 h-6 text-blue-900" />
                    Your Motivation
                  </h2>
                  <p className="text-gray-600">Tell us why you want to join UNIZIK Hostel</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Why do you want to join UNIZIK Hostel? *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                      errors.motivation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Share your motivations and what you hope to gain from being part of our community..."
                    rows="4"
                  />
                  {errors.motivation && <p className="text-red-500 text-sm mt-1">{errors.motivation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    How did you hear about us? *
                  </label>
                  <select
                    name="howHeardAbout"
                    value={formData.howHeardAbout}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition ${
                      errors.howHeardAbout ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select an option --</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend_family">Friend or Family</option>
                    <option value="church">Church</option>
                    <option value="website">Website</option>
                    <option value="event">Event</option>
                    <option value="news">News or Media</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.howHeardAbout && <p className="text-red-500 text-sm mt-1">{errors.howHeardAbout}</p>}
                </div>
              </div>
            )}

            {/* Step 5: Agreement & Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-blue-900" />
                    Review & Confirm
                  </h2>
                  <p className="text-gray-600">Please review and confirm your information</p>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{formData.city}, {formData.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Membership Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{formData.membershipType}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map(interest => (
                        <span key={interest} className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Agreement Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-900 mt-1 rounded"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        I agree to the Terms and Conditions
                      </p>
                      <p className="text-sm text-gray-600">
                        I have read and agree to UNIZIK Hostel's membership terms, code of conduct, and organizational values centered on faith, justice, and community service.
                      </p>
                    </div>
                  </label>
                  {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

                  <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      name="agreeToContact"
                      checked={formData.agreeToContact}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-900 mt-1 rounded"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        I consent to be contacted
                      </p>
                      <p className="text-sm text-gray-600">
                        I agree to be contacted by UNIZIK Hostel via email and phone regarding my membership application and community updates.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex gap-4 justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep === TOTAL_STEPS ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition ${
                    submitting
                      ? 'bg-blue-600 text-white cursor-not-allowed opacity-75'
                      : 'bg-blue-900 text-white hover:bg-blue-800'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <Users className="mx-auto w-8 h-8 text-blue-900 mb-3" />
            <p className="font-semibold text-gray-900">Community Driven</p>
            <p className="text-sm text-gray-600 mt-2">Join thousands of Nigerian-Americans</p>
          </div>
          <div className="p-6">
            <Heart className="mx-auto w-8 h-8 text-blue-900 mb-3" />
            <p className="font-semibold text-gray-900">Faith Based</p>
            <p className="text-sm text-gray-600 mt-2">Rooted in Christian values</p>
          </div>
          <div className="p-6">
            <Target className="mx-auto w-8 h-8 text-blue-900 mb-3" />
            <p className="font-semibold text-gray-900">Mission Driven</p>
            <p className="text-sm text-gray-600 mt-2">Making real impact together</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
