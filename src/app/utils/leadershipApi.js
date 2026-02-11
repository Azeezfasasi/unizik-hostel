// Fetch all leadership members
export async function fetchLeadership(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.department) params.append('department', filters.department);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await fetch(`/api/leadership?${params}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leadership members');
  }

  return response.json();
}

// Fetch single leadership member
export async function fetchLeadershipMember(id) {
  const response = await fetch(`/api/leadership/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leadership member');
  }

  return response.json();
}

// Create leadership member
export async function createLeadershipMember(data) {
  const response = await fetch('/api/leadership', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create leadership member');
  }

  return response.json();
}

// Update leadership member
export async function updateLeadershipMember(id, data) {
  const response = await fetch(`/api/leadership/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update leadership member');
  }

  return response.json();
}

// Delete leadership member
export async function deleteLeadershipMember(id) {
  const response = await fetch(`/api/leadership/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete leadership member');
  }

  return response.json();
}

// Upload image to Cloudinary via API route
export async function uploadLeadershipImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/leadership/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  return response.json();
}

// Delete image from Cloudinary via API route
export async function deleteLeadershipImage(publicId) {
  const response = await fetch('/api/leadership/upload', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete image');
  }

  return response.json();
}
