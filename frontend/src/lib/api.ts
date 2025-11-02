const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  signup: async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    return fetchWithAuth('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.access_token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    return fetchWithAuth('/api/v1/auth/me');
  },
};

// Family API
export const familyAPI = {
  createFamily: async (familyData: {
    familyName: string;
    parent1Email: string;
    parent2Email: string;
    custodyArrangement?: string;
  }) => {
    return fetchWithAuth('/api/v1/family', {
      method: 'POST',
      body: JSON.stringify(familyData),
    });
  },

  getFamily: async () => {
    return fetchWithAuth('/api/v1/family');
  },
};

// Children API
export const childrenAPI = {
  addChild: async (childData: {
    firstName: string;
    lastName?: string;
    dateOfBirth: string;
    gender?: string;
    school?: string;
    grade?: string;
    allergies?: string[];
    medications?: string[];
    notes?: string;
  }) => {
    return fetchWithAuth('/api/v1/children', {
      method: 'POST',
      body: JSON.stringify(childData),
    });
  },

  updateChild: async (childId: string, updates: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    school?: string;
    grade?: string;
    allergies?: string[];
    medications?: string[];
    notes?: string;
  }) => {
    return fetchWithAuth(`/api/v1/children/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteChild: async (childId: string) => {
    return fetchWithAuth(`/api/v1/children/${childId}`, {
      method: 'DELETE',
    });
  },
};

// Calendar API
export const calendarAPI = {
  getEvents: async (year: number, month: number) => {
    return fetchWithAuth(`/api/v1/calendar/events?year=${year}&month=${month}`);
  },

  createEvent: async (eventData: {
    family_id: string;
    date: string;
    type: string;
    title: string;
    parent?: string;
    isSwappable?: boolean;
  }) => {
    return fetchWithAuth('/api/v1/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  createChangeRequest: async (requestData: {
    event_id: string;
    requestedDate?: string;
    reason?: string;
  }) => {
    return fetchWithAuth('/api/v1/calendar/change-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  updateChangeRequest: async (requestId: string, status: 'approved' | 'rejected') => {
    return fetchWithAuth(`/api/v1/calendar/change-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getChangeRequests: async () => {
    return fetchWithAuth('/api/v1/calendar/change-requests');
  },
};