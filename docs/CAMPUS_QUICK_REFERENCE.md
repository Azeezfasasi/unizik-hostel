# Campus Management - Quick Reference

## Quick Start (Copy-Paste Ready)

### To use in any component:

```javascript
"use client";

import { useCampus } from "@/context/CampusContext";
import { HostelSelector, CampusFilter } from "@/components/CampusComponents";

export default function MyComponent() {
  // Get all hostels
  const { hostels, campuses, loading } = useCampus();

  // State for selection
  const [selectedHostel, setSelectedHostel] = useState("");
  const [campus, setCampus] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Option 1: Simple Hostel Selector */}
      <HostelSelector
        value={selectedHostel}
        onChange={setSelectedHostel}
        label="Choose Hostel"
      />

      {/* Option 2: Full Cascading Filters */}
      <CampusFilter
        selectedCampus={campus}
        onCampusChange={setCampus}
        selectedBlock={block}
        onBlockChange={setBlock}
        selectedFloor={floor}
        onFloorChange={setFloor}
      />

      {/* Use the data */}
      <div>
        {hostels.map((h) => (
          <p key={h._id}>{h.name}</p>
        ))}
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Filter by Gender

```javascript
const femaleHostels = hostels.filter((h) => h.genderRestriction === "female");
```

### Get Hostels for Campus

```javascript
const { getHostelsByCampus } = useCampus();
const campusHostels = getHostelsByCampus("Main Campus");
```

### Filtered Selector

```javascript
<HostelSelector
  value={hostel}
  onChange={setHostel}
  filterFn={(h) => h.hostelCampus === "Main Campus"}
/>
```

### Get Available Beds Info

```javascript
const hostel = hostels.find((h) => h._id === selectedId);
const available = hostel.capacity - hostel.currentOccupancy;
```

---

## API Reference

### useCampus() Hook

```javascript
const {
  campuses, // Array of unique campus names: string[]
  hostels, // Array of hostel objects: Hostel[]
  loading, // Boolean true while fetching
  error, // Error message or null
  fetchData, // Function to manually refresh
  getHostelsByCampus, // Function to filter by campus
} = useCampus();
```

### HostelSelector Props

```javascript
<HostelSelector
  value={string}                    // Required: selected hostel ID
  onChange={function}               // Required: (id) => {}
  label={string}                    // Optional: "Select Hostel"
  placeholder={string}              // Optional: "Choose..."
  disabled={boolean}                // Optional: false
  filterFn={(hostel) => boolean}   // Optional: custom filter
/>
```

### CampusFilter Props

```javascript
<CampusFilter
  selectedCampus={string}    // Current campus
  onCampusChange={function}  // (campus) => {}
  selectedBlock={string}     // Current block
  onBlockChange={function}   // (block) => {}
  selectedFloor={string}     // Current floor
  onFloorChange={function}   // (floor) => {}
/>
```

---

## Hostel Object Properties

```javascript
{
  _id: string,                      // MongoDB ID
  name: string,                     // "Pre-Degree Female Hostel"
  hostelCampus: string,             // "Main Campus"
  block: string,                    // "Block A"
  floor: string,                    // "Floor 1"
  location: string,                 // "Main Campus Center"
  genderRestriction: string,        // "male" | "female" | "mixed"
  description: string,              // Hostel description
  facilities: string[],             // ["WiFi", "AC", "Generator"]
  rulesAndPolicies: string,         // Rules text
  createdAt: Date,
  updatedAt: Date
}
```

---

## Component State Management

### Option 1: Single Hostel Selection

```javascript
const [hostel, setHostel] = useState("");
```

### Option 2: Campus → Block → Floor Cascade

```javascript
const [campus, setCampus] = useState("");
const [block, setBlock] = useState("");
const [floor, setFloor] = useState("");
```

### Option 3: Combined with Rooms

```javascript
const [filters, setFilters] = useState({
  campus: "",
  block: "",
  floor: "",
  hostel: "",
});

const handleChange = (key, value) => {
  setFilters((prev) => ({ ...prev, [key]: value }));
};
```

---

## Common Queries

### Get all unique campuses

```javascript
import { useCampuses } from "@/components/CampusComponents";
const campuses = useCampuses();
```

### Filter hostels by multiple criteria

```javascript
const { hostels } = useCampus();
const filtered = hostels.filter(
  (h) =>
    h.hostelCampus === campus &&
    h.block === block &&
    h.genderRestriction === "female",
);
```

### Get hostel name by ID

```javascript
const { hostels } = useCampus();
const hostel = hostels.find((h) => h._id === hostelId);
console.log(hostel.name);
```

### Count hostels per campus

```javascript
const { hostels } = useCampus();
const campuses = new Set(hostels.map((h) => h.hostelCampus));
const counts = {};
campuses.forEach((c) => {
  counts[c] = hostels.filter((h) => h.hostelCampus === c).length;
});
```

---

## Error Handling

```javascript
const { hostels, loading, error } = useCampus()

if (error) {
  return <div className="text-red-600">Error: {error}</div>
}

if (loading) {
  return <div>Loading hostels...</div>
}

return (
  // Your component
)
```

---

## Performance Tips

1. **Memoize filtered lists**

   ```javascript
   const filtered = useMemo(
     () => hostels.filter((h) => h.hostelCampus === campus),
     [hostels, campus],
   );
   ```

2. **Avoid large re-renders**

   ```javascript
   const handleChange = useCallback((id) => {
     setSelected(id);
   }, []);
   ```

3. **Use loading state wisely**
   ```javascript
   <select disabled={loading}>
   ```

---

## CSS Classes for Consistency

All reusable components use:

- `bg-white` - White backgrounds
- `rounded-lg` - Border radius
- `border border-gray-300` - Standard border
- `focus:ring-2 focus:ring-blue-500` - Focus state
- `text-sm font-medium text-gray-700` - Labels
- `disabled:opacity-50` - Disabled state

Add these to match styling:

```javascript
className="w-full px-4 py-2 border border-gray-300 rounded-lg
           focus:ring-2 focus:ring-blue-500 focus:border-transparent
           bg-white disabled:opacity-50"
```

---

## Common Issues & Solutions

| Issue                 | Solution                           |
| --------------------- | ---------------------------------- |
| Hostel list empty     | Check CampusProvider in layout     |
| Multiple API calls    | Use CampusContext instead of fetch |
| Filters not cascading | Use CampusFilter component         |
| Loading forever       | Check network tab, verify token    |
| Data not updating     | Call `fetchData()` manually        |

---

## Pages Using CampusContext

✅ Room Allocations: `/dashboard/room-allocations`
✅ Add Room: `/dashboard/add-room`
✅ Manage Rooms: `/dashboard/manage-rooms`
✅ Campus List: `/dashboard/campus-list`

---

## Need More Help?

📖 Full guide: `docs/CAMPUS_MANAGEMENT_GUIDE.md`
📋 Implementation details: `docs/CAMPUS_IMPLEMENTATION_SUMMARY.md`
💻 View source: `src/context/CampusContext.js`
🎨 Components: `src/components/CampusComponents.js`

---

_Last updated: February 10, 2026_
