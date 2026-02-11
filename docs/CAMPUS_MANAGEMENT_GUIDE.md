# Campus Management System Documentation

## Overview

The campus management system provides a centralized way to manage hostels, campuses, and room allocations across the entire application. It includes:

1. **CampusContext** - Shared state management for campuses and hostels
2. **Professional Campus List Page** - UI for viewing and managing campus information
3. **Reusable Components** - For campus/hostel filtering across the application

## Architecture

### CampusContext (`src/context/CampusContext.js`)

The `CampusContext` provides:
- Centralized fetching of hostels data
- Shared state across all dashboard components
- Automatic data refresh
- Error handling

#### Usage:

```javascript
import { useCampus } from '@/context/CampusContext'

export default function MyComponent() {
  const { campuses, hostels, loading, error, getHostelsByCampus } = useCampus()
  
  // Use the data
  return (
    <div>
      {hostels.map(h => <p key={h._id}>{h.name}</p>)}
    </div>
  )
}
```

#### Available Methods:

- `campuses` - Array of unique campus names
- `hostels` - Array of all hostel objects
- `loading` - Boolean indicating loading state
- `error` - Error message if fetch fails
- `fetchData()` - Function to manually refresh data
- `getHostelsByCampus(campusName)` - Get hostels for specific campus

---

## Reusable Components

### 1. HostelSelector

A dropdown component that lets users select a hostel with campus information.

#### Usage:

```javascript
import { HostelSelector } from '@/components/CampusComponents'

export default function MyForm() {
  const [selectedHostel, setSelectedHostel] = useState('')
  
  return (
    <HostelSelector
      value={selectedHostel}
      onChange={setSelectedHostel}
      label="Select a Hostel"
      placeholder="Choose a hostel"
    />
  )
}
```

#### Props:

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| value | string | Currently selected hostel ID | Yes |
| onChange | function | Callback when selection changes | Yes |
| label | string | Label for the select | No |
| placeholder | string | Placeholder text | No |
| disabled | boolean | Disable the select | No |
| filterFn | function | Custom filter function | No |

#### Example with Filter:

```javascript
<HostelSelector
  value={selectedHostel}
  onChange={setSelectedHostel}
  label="Female Hostels"
  filterFn={(hostel) => hostel.genderRestriction === 'female'}
/>
```

---

### 2. CampusFilter

A complete filtering system with cascading campus → block → floor selection.

#### Usage:

```javascript
import { CampusFilter } from '@/components/CampusComponents'

export default function RoomSearchPage() {
  const [campus, setCampus] = useState('')
  const [block, setBlock] = useState('')
  const [floor, setFloor] = useState('')
  
  return (
    <CampusFilter
      selectedCampus={campus}
      selectedBlock={block}
      selectedFloor={floor}
      onCampusChange={setCampus}
      onBlockChange={setBlock}
      onFloorChange={setFloor}
    />
  )
}
```

#### Features:

- Cascading dropdowns (selecting campus automatically filters blocks)
- Automatic reset of dependent filters
- Automatic disabling when no options available
- Beautiful, responsive UI

---

### 3. useCampuses Hook

A utility hook to get all unique campuses.

#### Usage:

```javascript
import { useCampuses } from '@/components/CampusComponents'

export default function CampusStatistics() {
  const campuses = useCampuses()
  
  return (
    <div>
      <h2>Campuses: {campuses.length}</h2>
      {campuses.map(campus => <p key={campus}>{campus}</p>)}
    </div>
  )
}
```

---

## Pages

### Campus Management Page (`src/app/dashboard/campus-list/page.js`)

A professional, full-featured campus management interface.

#### Features:

- Display all campuses with hostel counts
- Show occupancy statistics per campus
- Search and sort functionality
- Beautiful card layouts
- Action buttons (View, Edit, Delete)
- Mobile-responsive design
- Error handling and loading states

#### Displays:

For each campus:
- Campus name
- Number of hostels
- Total capacity
- Available beds
- Occupied beds
- Occupancy rate (with progress bar)
- List of hostels in campus

---

## Updated Components

The following components have been updated to use CampusContext:

### 1. Room Allocations Page
- **File**: `src/app/dashboard/room-allocations/page.js`
- **Changes**: Now fetches hostels from CampusContext instead of API
- **Benefit**: Reduced API calls, shared state

### 2. Add Room Page
- **File**: `src/app/dashboard/add-room/page.js`
- **Changes**: Uses CampusContext for hostel dropdown
- **Benefit**: Real-time hostel list, reduced API calls

### 3. Manage Rooms Page
- **File**: `src/app/dashboard/manage-rooms/page.js`
- **Changes**: Uses CampusContext for hostel filtering
- **Benefit**: Consistent filtering, shared state

---

## Integration Guide

### For New Components

To add campus/hostel functionality to a new component:

1. **Import the hook**:
   ```javascript
   import { useCampus } from '@/context/CampusContext'
   ```

2. **Use in component**:
   ```javascript
   const { hostels, campuses, loading } = useCampus()
   ```

3. **Ensure CampusProvider is in layout** (already done in dashboard layout)

### Example: New Hostel Management Form

```javascript
'use client'

import { useState } from 'react'
import { HostelSelector, CampusFilter } from '@/components/CampusComponents'
import { useCampus } from '@/context/CampusContext'

export default function ManageHostels() {
  const { hostels } = useCampus()
  const [selectedHostelId, setSelectedHostelId] = useState('')
  const [campus, setCampus] = useState('')
  const [block, setBlock] = useState('')
  const [floor, setFloor] = useState('')

  const handleFilters = () => {
    const filtered = hostels.filter(h => {
      const campusMatch = !campus || h.hostelCampus === campus
      const blockMatch = !block || h.block === block
      const floorMatch = !floor || h.floor === floor
      return campusMatch && blockMatch && floorMatch
    })
    console.log('Filtered hostels:', filtered)
  }

  return (
    <div className="space-y-6">
      <CampusFilter
        selectedCampus={campus}
        selectedBlock={block}
        selectedFloor={floor}
        onCampusChange={setCampus}
        onBlockChange={setBlock}
        onFloorChange={setFloor}
      />
      
      <button onClick={handleFilters}>Apply Filters</button>
    </div>
  )
}
```

---

## Best Practices

1. **Use CampusContext instead of direct API calls** for hostels data
2. **Leverage reusable components** for consistency across the app
3. **Use cascading filters** for better UX in listing pages
4. **Cache data** using CampusContext to reduce back-and-forth API calls
5. **Handle loading states** when using async operations

---

## Performance Considerations

- CampusContext caches data until `fetchData()` is called manually
- All components using `useCampus()` share the same data
- No redundant API calls for the same data
- Only one fetch per page load (in the provider)

---

## Data Structure

### Hostel Object:

```javascript
{
  _id: ObjectId,
  name: string,              // e.g., "Pre-Degree Female Hostel"
  hostelCampus: string,      // e.g., "Main Campus"
  block: string,             // e.g., "Block A"
  floor: string,             // e.g., "Floor 1"
  location: string,
  genderRestriction: string, // 'male', 'female', 'mixed'
  description: string,
  facilities: [string],
  rulesAndPolicies: string,
  timestamps: { createdAt, updatedAt }
}
```

---

## Troubleshooting

### Hostels not loading?
- Check that CampusProvider wraps your component (it's in dashboard layout)
- Verify auth token is available
- Check browser console for API errors

### Filters not showing options?
- Ensure hostels data is fetched (check loading state)
- Verify hostelCampus, block, floor values exist in data
- Check if filters are properly cascading

### Components duplicating API calls?
- Ensure all components use CampusContext instead of direct fetch
- Check that CampusProvider is only in one place (dashboard layout)

---

## Future Enhancements

- Add pagination for large campus lists
- Implement campus creation/editing forms
- Add bulk operations for hostels
- Add campus statistics dashboard
- Implement campus usage analytics
- Add hostel occupancy trends

