'use client'

import React from 'react'
import { useCampus } from '@/context/CampusContext'
import { Loader } from 'lucide-react'

/**
 * HostelSelector Component
 * A reusable component for selecting a hostel with campus filtering
 * 
 * @param {string} value - The currently selected hostel ID
 * @param {function} onChange - Callback when hostel is selected
 * @param {string} placeholder - Placeholder text for the select
 * @param {string} label - Label for the select (optional)
 * @param {boolean} disabled - Disable the select (optional)
 * @param {function} filterFn - Optional custom filter function
 */
export const HostelSelector = ({
  value,
  onChange,
  placeholder = 'Select a hostel',
  label,
  disabled = false,
  filterFn,
}) => {
  const { hostels, loading } = useCampus()

  const filteredHostels = filterFn ? hostels.filter(filterFn) : hostels

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        {loading && <Loader className="absolute right-3 top-3 text-gray-400 animate-spin" size={20} />}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {filteredHostels.map((hostel) => (
            <option key={hostel._id} value={hostel._id}>
              {hostel.name} ({hostel.hostelCampus})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/**
 * CampusFilter Component
 * A reusable component for filtering by campus with cascading blocks and floors
 */
export const CampusFilter = ({
  selectedCampus,
  selectedBlock,
  selectedFloor,
  onCampusChange,
  onBlockChange,
  onFloorChange,
}) => {
  const { hostels } = useCampus()

  // Extract unique campuses
  const campuses = Array.from(new Set(hostels.map((h) => h.hostelCampus).filter(Boolean)))

  // Get blocks for selected campus
  const blocks = selectedCampus
    ? Array.from(
        new Set(
          hostels
            .filter((h) => h.hostelCampus === selectedCampus)
            .map((h) => h.block)
            .filter(Boolean)
        )
      )
    : []

  // Get floors for selected block
  const floors = selectedBlock
    ? Array.from(
        new Set(
          hostels
            .filter(
              (h) => h.hostelCampus === selectedCampus && h.block === selectedBlock
            )
            .map((h) => h.floor)
            .filter(Boolean)
        )
      )
    : []

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Campus Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
        <select
          value={selectedCampus}
          onChange={(e) => {
            onCampusChange(e.target.value)
            onBlockChange('all')
            onFloorChange('all')
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">All Campuses</option>
          {campuses.map((campus) => (
            <option key={campus} value={campus}>
              {campus}
            </option>
          ))}
        </select>
      </div>

      {/* Block Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
        <select
          value={selectedBlock}
          onChange={(e) => {
            onBlockChange(e.target.value)
            onFloorChange('all')
          }}
          disabled={blocks.length === 0}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50"
        >
          <option value="">All Blocks</option>
          {blocks.map((block) => (
            <option key={block} value={block}>
              {block}
            </option>
          ))}
        </select>
      </div>

      {/* Floor Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
        <select
          value={selectedFloor}
          onChange={(e) => onFloorChange(e.target.value)}
          disabled={floors.length === 0}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50"
        >
          <option value="">All Floors</option>
          {floors.map((floor) => (
            <option key={floor} value={floor}>
              {floor}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/**
 * CampusList Component
 * A reusable component to get all available campuses
 */
export const useCampuses = () => {
  const { hostels } = useCampus()
  return Array.from(new Set(hostels.map((h) => h.hostelCampus).filter(Boolean)))
}

export default { HostelSelector, CampusFilter, useCampuses }
