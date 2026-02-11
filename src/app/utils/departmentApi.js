// Get all active departments
export async function fetchDepartments() {
  const response = await fetch('/api/departments?active=true', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }

  return response.json();
}

// Get all departments (including inactive)
export async function fetchAllDepartments() {
  const response = await fetch('/api/departments?active=false', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }

  return response.json();
}

// Get single department
export async function fetchDepartment(id) {
  const response = await fetch(`/api/departments/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch department');
  }

  return response.json();
}

// Create department
export async function createDepartment(data) {
  const response = await fetch('/api/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create department');
  }

  return response.json();
}

// Update department
export async function updateDepartment(id, data) {
  const response = await fetch(`/api/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update department');
  }

  return response.json();
}

// Delete department
export async function deleteDepartment(id) {
  const response = await fetch(`/api/departments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete department');
  }

  return response.json();
}
