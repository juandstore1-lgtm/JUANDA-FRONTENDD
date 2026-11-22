import { AuditLog, User, Store, Category, Product, HeroSlide, RouletteSetting, MysteryBoxSetting, Contest, ContestParticipant, ContestWinner, HomeCategoryCollection, TicketPurchaseRequest, TicketReservation, JobVacancy, JobApplication, JobInterview, RecruitmentSummary } from '../types';

const API_URL = import.meta.env?.VITE_API_URL || 'https://juanda-backend-production.up.railway.app/api';

// Evento que AuthContext escucha para cerrar la sesión en memoria cuando el backend responde 401
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';
export const SESSION_EXPIRED_MESSAGE = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
export const ACCESS_DENIED_MESSAGE = 'No tienes permisos para realizar esta acción.';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const clearStoredSession = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('admin_user');
};

// Solo el primer 401 encuentra el token guardado: así varias peticiones fallidas a la vez avisan una sola vez
const expireSession = () => {
  if (localStorage.getItem('jwt_token') === null) return;
  clearStoredSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const getAuthHeadersOnly = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// sentToken = false en las peticiones públicas que nunca envían el token: su 401 no significa sesión expirada
const handleResponse = async (res: Response, sentToken = true) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const backendMsg = error.message || error.error || error.detail;
    if (res.status === 401 && sentToken) {
      expireSession();
      throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);
    }
    if (res.status === 403) {
      // 403 = sesión válida sin permiso para esta acción: no se cierra la sesión
      throw new ApiError(backendMsg || ACCESS_DENIED_MESSAGE, 403);
    }
    throw new ApiError(backendMsg || `Error (${res.status}): No se pudo completar la solicitud`, res.status);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const ProductService = {
  getProducts: async (storeId?: string): Promise<Product[]> => {
    const res = await fetch(`${API_URL}/products`, { headers: getHeaders() });
    const data = await handleResponse(res);
    const mapped = data.map((p: any) => ({
      ...p,
      id: String(p.id),
      storeIds: p.storeIds ? p.storeIds.map(String) : []
    }));
    if (storeId) {
      return mapped.filter((p: Product) => p.storeIds?.includes(storeId));
    }
    return mapped;
  },
  
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...product,
        storeIds: product.storeIds ? product.storeIds.map(Number) : []
      })
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id),
      storeIds: data.storeIds ? data.storeIds.map(String) : []
    };
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        ...updates,
        storeIds: updates.storeIds ? updates.storeIds.map(Number) : undefined
      })
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id),
      storeIds: data.storeIds ? data.storeIds.map(String) : []
    };
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

const DEFAULT_FALLBACK_STORES: Store[] = [
  { id: '1', name: "JUAN'D STORE - República de Israel", address: 'Carrera 46 # 38a-59', barrio: 'República de Israel', phone: '3157891234', schedule: '10:00 a.m. - 8:00 p.m.', image: '', description: 'Sede Principal' },
  { id: '2', name: "JUAN'D STORE - Ciudad Modelo", address: 'Calle 29 # 40a-19', barrio: 'Ciudad Modelo', phone: '3161234567', schedule: '10:00 a.m. - 8:00 p.m.', image: '', description: 'Sede Ciudad Modelo' },
  { id: '3', name: 'QUALITY STORE - Villa Colombia', address: 'Calle 52 # 13a-6', barrio: 'Villa Colombia', phone: '3174567890', schedule: '10:00 a.m. - 8:00 p.m.', image: '', description: 'Sede Villa Colombia' },
  { id: '4', name: 'QUALITY STORE - Mariano Ramos', address: 'Cra. 46 con Cl. 40', barrio: 'Mariano Ramos', phone: '3187654321', schedule: '10:00 a.m. - 8:00 p.m.', image: '', description: 'Sede Mariano Ramos' },
];

let storesCache: Store[] | null = null;

export const StoreService = {
  getStores: async (): Promise<Store[]> => {
    if (storesCache && storesCache.length > 0) return storesCache;
    try {
      const res = await fetch(`${API_URL}/sedes`, { headers: getHeaders() });
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) {
        storesCache = data.map((s: any) => ({
          ...s,
          id: String(s.id)
        }));
        return storesCache;
      }
    } catch {
      // Fallback a sedes por defecto
    }
    storesCache = DEFAULT_FALLBACK_STORES;
    return storesCache;
  },
  
  createStore: async (store: Omit<Store, 'id'>): Promise<Store> => {
    storesCache = null; // Clear cache
    const res = await fetch(`${API_URL}/sedes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(store)
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id)
    };
  },
  
  updateStore: async (id: string, updates: Partial<Store>): Promise<Store> => {
    storesCache = null; // Clear cache
    const res = await fetch(`${API_URL}/sedes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id)
    };
  },
  
  deleteStore: async (id: string): Promise<void> => {
    storesCache = null; // Clear cache
    const res = await fetch(`${API_URL}/sedes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

const USERS_STORAGE_KEY = 'juand_system_users_catalog_v2';

const DEFAULT_INITIAL_USERS: User[] = [
  {
    id: 'ADM-1001',
    name: 'Yeferson Alexis Muñoz',
    documentType: 'CC',
    documentNumber: '1144098234',
    phone: '3157891234',
    email: 'admin.republica@juandstore.com',
    username: 'admin.republica',
    role: { id: 'r2', name: 'STORE_ADMIN' },
    storeIds: ['1'],
    assignedStoreNames: ["JUAN'D STORE - República de Israel"],
    status: 'ACTIVO',
    isActive: true,
    createdAt: '2026-01-15T10:30:00Z',
    lastLogin: '2026-11-21T18:45:00Z'
  },
  {
    id: 'ADM-1002',
    name: 'Daniela Andrea Castillo',
    documentType: 'CC',
    documentNumber: '1116234567',
    phone: '3174567890',
    email: 'admin.villacolombia@juandstore.com',
    username: 'admin.villacolombia',
    role: { id: 'r2', name: 'STORE_ADMIN' },
    storeIds: ['3'],
    assignedStoreNames: ['QUALITY STORE - Villa Colombia'],
    status: 'ACTIVO',
    isActive: true,
    createdAt: '2026-02-10T14:20:00Z',
    lastLogin: '2026-11-21T19:10:00Z'
  },
  {
    id: 'ADM-1003',
    name: 'Juliana Marcela Morales',
    documentType: 'CC',
    documentNumber: '1143876543',
    phone: '3161234567',
    email: 'admin.ciudadmodelo@juandstore.com',
    username: 'admin.ciudadmodelo',
    role: { id: 'r2', name: 'STORE_ADMIN' },
    storeIds: ['2'],
    assignedStoreNames: ["JUAN'D STORE - Ciudad Modelo"],
    status: 'ACTIVO',
    isActive: true,
    createdAt: '2026-03-05T09:15:00Z',
    lastLogin: '2026-11-20T21:05:00Z'
  },
  {
    id: 'ADM-1004',
    name: 'Paola Andrea Rentería',
    documentType: 'CC',
    documentNumber: '1130456123',
    phone: '3187654321',
    email: 'admin.marianoramos@juandstore.com',
    username: 'admin.marianoramos',
    role: { id: 'r2', name: 'STORE_ADMIN' },
    storeIds: ['4'],
    assignedStoreNames: ['QUALITY STORE - Mariano Ramos'],
    status: 'ACTIVO',
    isActive: true,
    createdAt: '2026-04-12T11:00:00Z',
    lastLogin: '2026-11-21T16:30:00Z'
  },
  {
    id: 'ADM-1000',
    name: 'Juan David (Superadmin)',
    documentType: 'CC',
    documentNumber: '1144001122',
    phone: '3109988776',
    email: 'admin@juandstore.com',
    username: 'superadmin',
    role: { id: 'r1', name: 'GLOBAL_ADMIN' },
    storeIds: [],
    assignedStoreNames: ['Todas las sedes (Global)'],
    status: 'ACTIVO',
    isActive: true,
    createdAt: '2025-11-01T08:00:00Z',
    lastLogin: '2026-11-21T21:15:00Z'
  }
];

const loadLocalUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveLocalUsers(DEFAULT_INITIAL_USERS);
  return DEFAULT_INITIAL_USERS;
};

const saveLocalUsers = (users: User[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
};

export const UserService = {
  getUsers: async (): Promise<User[]> => {
    const localUsers = loadLocalUsers();
    try {
      const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
      const data = await handleResponse(res).catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        const merged: User[] = data.map((u: any) => {
          const match = localUsers.find(l => String(l.id) === String(u.id) || l.email === u.email);
          return {
            id: String(u.id),
            name: u.name,
            documentType: match?.documentType || 'CC',
            documentNumber: match?.documentNumber || '',
            phone: match?.phone || '',
            email: u.email,
            username: match?.username || u.email?.split('@')[0] || `user_${u.id}`,
            role: { id: u.roleName === 'GLOBAL_ADMIN' ? 'r1' : 'r2', name: u.roleName },
            storeIds: u.storeIds ? u.storeIds.map(String) : [],
            assignedStoreNames: match?.assignedStoreNames,
            status: match?.status || (u.isActive ? 'ACTIVO' : 'INACTIVO'),
            isActive: !!u.isActive,
            createdAt: match?.createdAt || new Date().toISOString(),
            lastLogin: match?.lastLogin || 'Sin accesos registrados'
          };
        });
        
        const localOnly = localUsers.filter(l => !merged.some(m => String(m.id) === String(l.id) || m.email === l.email));
        const fullList = [...merged, ...localOnly];
        saveLocalUsers(fullList);
        return fullList;
      }
    } catch {}
    return localUsers;
  },
  
  createUser: async (user: Omit<User, 'id'> & { id?: string }): Promise<User> => {
    const localUsers = loadLocalUsers();
    const newId = user.id || `ADM-${1000 + localUsers.length + 1}`;
    const status = user.status || (user.isActive ? 'ACTIVO' : 'INACTIVO');
    const newUser: User = {
      ...user,
      id: newId,
      status,
      isActive: status === 'ACTIVO',
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: user.lastLogin || 'Sin accesos registrados'
    };
    
    try {
      await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          roleName: newUser.role?.name,
          storeIds: newUser.storeIds?.map(Number),
          isActive: newUser.isActive
        })
      });
    } catch {}

    const updated = [newUser, ...localUsers.filter(u => u.id !== newId)];
    saveLocalUsers(updated);
    return newUser;
  },
  
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const localUsers = loadLocalUsers();
    const existingIndex = localUsers.findIndex(u => String(u.id) === String(id));
    const current = existingIndex >= 0 ? localUsers[existingIndex] : null;
    
    const status = updates.status || (updates.isActive !== undefined ? (updates.isActive ? 'ACTIVO' : 'INACTIVO') : current?.status || 'ACTIVO');
    const updatedUser: User = {
      ...(current || ({} as User)),
      ...updates,
      id: String(id),
      status,
      isActive: status === 'ACTIVO'
    };

    try {
      await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
          password: updatedUser.password || undefined,
          roleName: updatedUser.role?.name,
          storeIds: updatedUser.storeIds?.map(Number),
          isActive: updatedUser.isActive
        })
      });
    } catch {}

    const updatedList = localUsers.map(u => String(u.id) === String(id) ? updatedUser : u);
    saveLocalUsers(updatedList);
    return updatedUser;
  },
  
  deleteUser: async (id: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch {}
    const localUsers = loadLocalUsers();
    saveLocalUsers(localUsers.filter(u => String(u.id) !== String(id)));
  },
  
  getMe: async (): Promise<User> => {
    try {
      const res = await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
      const u = await handleResponse(res);
      return {
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: { id: u.roleName === 'GLOBAL_ADMIN' ? 'r1' : 'r2', name: u.roleName },
        storeIds: u.storeIds ? u.storeIds.map(String) : [],
        isActive: !!u.isActive,
        status: u.isActive ? 'ACTIVO' : 'INACTIVO'
      };
    } catch {
      const localUsers = loadLocalUsers();
      return localUsers[0];
    }
  }
};

export const DashboardService = {
  getMetrics: async (user: User) => {
    try {
      const products = await ProductService.getProducts();
      let productCount = 0;
      
      if (user.role.name === 'GLOBAL_ADMIN') {
        productCount = products.length;
      } else {
        productCount = products.filter(p => p.storeIds?.some(id => user.storeIds?.includes(id))).length;
      }

      return {
        totalProducts: productCount,
        totalMessages: 0,
        totalAdmins: 1,
        totalGalleryImages: 0,
        activePromos: 0
      };
    } catch (e) {
      return {
        totalProducts: 0,
        totalMessages: 0,
        totalAdmins: 0,
        totalGalleryImages: 0,
        activePromos: 0
      };
    }
  }
};

export const CategoryService = {
  // includeImage: false pide el listado sin imágenes (solo para pantallas que no las muestran)
  getCategories: async (storeId?: string | number, options: { includeImage?: boolean } = {}): Promise<Category[]> => {
    const params = new URLSearchParams();
    if (storeId) params.set('storeId', String(storeId));
    if (options.includeImage === false) params.set('includeImage', 'false');
    const query = params.toString();
    const url = query ? `${API_URL}/categories?${query}` : `${API_URL}/categories`;
    const res = await fetch(url, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.map((c: any) => ({
      id: String(c.id),
      name: c.name,
      image: c.image,
      storeId: c.storeId ? String(c.storeId) : undefined
    }));
  },
  createCategory: async (category: { name: string; image?: string; storeId?: number | string }): Promise<Category> => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: category.name,
        image: category.image,
        storeId: category.storeId ? Number(category.storeId) : null
      })
    });
    const data = await handleResponse(res);
    return {
      id: String(data.id),
      name: data.name,
      image: data.image,
      storeId: data.storeId ? String(data.storeId) : undefined
    };
  },
  updateCategory: async (id: number | string, category: { name: string; image?: string; storeId?: number | string }): Promise<Category> => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        name: category.name,
        image: category.image,
        storeId: category.storeId ? Number(category.storeId) : null
      })
    });
    const data = await handleResponse(res);
    return {
      id: String(data.id),
      name: data.name,
      image: data.image,
      storeId: data.storeId ? String(data.storeId) : undefined
    };
  },
  deleteCategory: async (id: number | string): Promise<void> => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

export const HomeService = {
  getHeroConfig: async (): Promise<{ slides: HeroSlide[] }> => {
    try {
      const response = await fetch(`${API_URL}/home/hero`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Error fetching hero config:", error);
      return { slides: [] };
    }
  },
  addHeroSlide: async (slide: Omit<HeroSlide, 'id'>): Promise<HeroSlide> => {
    const res = await fetch(`${API_URL}/home/hero/slides`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(slide)
    });
    const data = await handleResponse(res);
    return { ...data, id: String(data.id) };
  },
  updateHeroSlide: async (id: string | number, slide: Partial<HeroSlide>): Promise<HeroSlide> => {
    const res = await fetch(`${API_URL}/home/hero/slides/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(slide)
    });
    const data = await handleResponse(res);
    return { ...data, id: String(data.id) };
  },
  deleteHeroSlide: async (id: string | number): Promise<void> => {
    const res = await fetch(`${API_URL}/home/hero/slides/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  },
  getRouletteConfig: async (): Promise<RouletteSetting> => {
    const res = await fetch(`${API_URL}/home/roulette-setting`, { headers: getHeaders() });
    return handleResponse(res);
  },
  updateRouletteConfig: async (setting: RouletteSetting): Promise<RouletteSetting> => {
    const res = await fetch(`${API_URL}/home/roulette-setting`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(setting)
    });
    return handleResponse(res);
  },
  getMysteryBoxConfig: async (): Promise<MysteryBoxSetting> => {
    const res = await fetch(`${API_URL}/home/mystery-box`, { headers: getHeaders() });
    return handleResponse(res);
  },
  updateMysteryBoxConfig: async (setting: MysteryBoxSetting): Promise<MysteryBoxSetting> => {
    const res = await fetch(`${API_URL}/home/mystery-box`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(setting)
    });
    return handleResponse(res);
  },
  getHomeCollections: async (): Promise<HomeCategoryCollection[]> => {
    const res = await fetch(`${API_URL}/home/collections`);
    return handleResponse(res);
  },
  createHomeCollection: async (item: Omit<HomeCategoryCollection, 'id'>): Promise<HomeCategoryCollection> => {
    const res = await fetch(`${API_URL}/home/collections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item)
    });
    return handleResponse(res);
  },
  updateHomeCollection: async (id: number, item: Partial<HomeCategoryCollection>): Promise<HomeCategoryCollection> => {
    const res = await fetch(`${API_URL}/home/collections/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(item)
    });
    return handleResponse(res);
  },
  deleteHomeCollection: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/home/collections/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

export const GalleryService = {
  getImages: async (): Promise<GalleryImage[]> => {
    const res = await fetch(`${API_URL}/gallerys`, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.map((item: any) => ({
      ...item,
      id: String(item.id),
      storeId: item.storeId ? String(item.storeId) : undefined
    }));
  },
  createImage: async (image: Omit<GalleryImage, 'id'>): Promise<GalleryImage> => {
    const res = await fetch(`${API_URL}/gallerys`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...image,
        storeId: image.storeId ? Number(image.storeId) : null
      })
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id),
      storeId: data.storeId ? String(data.storeId) : undefined
    };
  },
  updateImage: async (id: string, updates: Partial<GalleryImage>): Promise<GalleryImage> => {
    const res = await fetch(`${API_URL}/gallerys/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        ...updates,
        storeId: updates.storeId ? Number(updates.storeId) : null
      })
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id),
      storeId: data.storeId ? String(data.storeId) : undefined
    };
  },
  deleteImage: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/gallerys/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

export const VideoService = {
  getVideos: async (): Promise<Video[]> => {
    const res = await fetch(`${API_URL}/videos`, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.map((v: any) => ({
      ...v,
      id: String(v.id)
    }));
  },
  createVideo: async (video: Omit<Video, 'id'>): Promise<Video> => {
    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(video)
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id)
    };
  },
  updateVideo: async (id: string, updates: Partial<Video>): Promise<Video> => {
    const res = await fetch(`${API_URL}/videos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await handleResponse(res);
    return {
      ...data,
      id: String(data.id)
    };
  },
  deleteVideo: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

export const ContestService = {
  // Solo el endpoint público: /contests/admin/** requiere GLOBAL_ADMIN y no se consulta desde aquí
  getActiveContest: async (): Promise<Contest | null> => {
    try {
      const res = await fetch(`${API_URL}/contests/public/active`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) {
          const data = JSON.parse(text);
          if (data && data.id) return data;
        }
      }
      return null;
    } catch {
      return null;
    }
  },
  submitParticipation: async (participant: ContestParticipant): Promise<ContestParticipant> => {
    const res = await fetch(`${API_URL}/contests/public/participate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant)
    });
    return await handleResponse(res, false);
  },
  getPublicWinner: async (contestId?: number): Promise<ContestWinner | null> => {
    try {
      const url = contestId ? `${API_URL}/contests/public/winner?contestId=${contestId}` : `${API_URL}/contests/public/winner`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
  getPublicParticipants: async (contestId?: number): Promise<any[]> => {
    try {
      const url = contestId ? `${API_URL}/contests/public/participants?contestId=${contestId}` : `${API_URL}/contests/public/participants`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },
  getAllContests: async (): Promise<Contest[]> => {
    const res = await fetch(`${API_URL}/contests/admin/all`, { headers: getHeaders() });
    return await handleResponse(res);
  },
  // Ganador con datos de contacto (GLOBAL_ADMIN); el endpoint público ya no los devuelve. Sin ganador: null
  getWinner: async (contestId: number): Promise<ContestWinner | null> => {
    const res = await fetch(`${API_URL}/contests/admin/${contestId}/winner`, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data && data.id ? data : null;
  },
  createContest: async (contest: Partial<Contest>): Promise<Contest> => {
    const res = await fetch(`${API_URL}/contests/admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contest)
    });
    return await handleResponse(res);
  },
  updateContest: async (id: number, contest: Partial<Contest>): Promise<Contest> => {
    const res = await fetch(`${API_URL}/contests/admin/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(contest)
    });
    return await handleResponse(res);
  },
  getParticipants: async (contestId: number): Promise<ContestParticipant[]> => {
    const res = await fetch(`${API_URL}/contests/admin/${contestId}/participants`, { headers: getHeaders() });
    return await handleResponse(res);
  },
  selectWinner: async (contestId: number): Promise<ContestWinner> => {
    const res = await fetch(`${API_URL}/contests/admin/${contestId}/select-winner`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },
  resetContest: async (contestId: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/contests/admin/${contestId}/reset`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },
  toggleParticipantDisplay: async (participantId: number): Promise<ContestParticipant> => {
    const res = await fetch(`${API_URL}/contests/admin/participants/${participantId}/toggle-display`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },
  deleteParticipant: async (participantId: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/contests/admin/participants/${participantId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  }
};

// ---------------- RAFFLES ----------------

export const RaffleService = {
  getAllRaffles: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/raffles`);
    const data = await handleResponse(res);
    return data.map((d: any) => ({ ...d, id: String(d.id) }));
  },
  getRaffleById: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/raffles/${id}`);
    const data = await handleResponse(res);
    return { ...data, id: String(data.id) };
  },
  createRaffle: async (raffle: any): Promise<any> => {
    const res = await fetch(`${API_URL}/raffles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(raffle)
    });
    const data = await handleResponse(res);
    return { ...data, id: String(data.id) };
  },
  updateRaffle: async (id: string, raffle: any): Promise<any> => {
    const res = await fetch(`${API_URL}/raffles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(raffle)
    });
    const data = await handleResponse(res);
    return { ...data, id: String(data.id) };
  },
  deleteRaffle: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/raffles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

const mapTickets = (data: any[]) => data.map((d: any) => ({
  ...d,
  id: String(d.id),
  raffleId: String(d.raffleId)
}));

export const TicketService = {
  // Vista pública: "buyer" siempre llega null
  getTicketsByRaffle: async (raffleId: string): Promise<any[]> => {
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets`);
    return mapTickets(await handleResponse(res, false));
  },
  // Vista de administración (GLOBAL_ADMIN): incluye los datos del comprador
  getTicketsWithBuyers: async (raffleId: string): Promise<any[]> => {
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets/admin`, { headers: getHeaders() });
    return mapTickets(await handleResponse(res));
  },
  // Compra pública: nunca envía el JWT. Reserva los boletos (no los vende) hasta reservedUntil
  purchaseTickets: async (raffleId: string, request: TicketPurchaseRequest): Promise<TicketReservation> => {
    const payload = {
      ticketIds: request.ticketIds.map((id: string) => Number(id)),
      buyer: request.buyer
    };
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse(res, false);
    return {
      raffleId: String(data.raffleId),
      ticketIds: (data.ticketIds ?? []).map(String),
      ticketNumbers: data.ticketNumbers ?? [],
      status: data.status,
      reservedUntil: data.reservedUntil
    };
  },
  // buyerId: comprador que muestra el panel; el backend rechaza la acción si la reserva cambió de comprador
  approveTicket: async (raffleId: string, ticketId: string, buyerId?: string): Promise<void> => {
    const query = buyerId ? `?buyerId=${encodeURIComponent(buyerId)}` : '';
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets/${ticketId}/approve${query}`, {
      method: 'PUT',
      headers: getHeaders()
    });
    await handleResponse(res);
  },
  cancelTicket: async (raffleId: string, ticketId: string, buyerId?: string): Promise<void> => {
    const query = buyerId ? `?buyerId=${encodeURIComponent(buyerId)}` : '';
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets/${ticketId}/cancel${query}`, {
      method: 'PUT',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};


// ----------------- CLOUDFLARE R2 STORAGE -----------------

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  contentType: string;
  expiresInSeconds: number;
}

export const StorageService = {
  getPresignedUrl: async (entity: string, file: File, isPublic = false): Promise<PresignedUrlResponse> => {
    const endpoint = isPublic ? '/storage/public/presigned-url' : '/storage/presigned-url';
    const url = API_URL + endpoint;
    const res = await fetch(url, {
      method: 'POST',
      headers: isPublic ? { 'Content-Type': 'application/json' } : getHeaders(),
      body: JSON.stringify({
        entity,
        contentType: file.type || 'image/webp',
        originalFilename: file.name,
        fileSize: file.size
      })
    });
    return await handleResponse(res, !isPublic);
  },

  uploadFile: async (entity: string, file: File, isPublic = false): Promise<string> => {
    const presigned = await StorageService.getPresignedUrl(entity, file, isPublic);
    const uploadRes = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': presigned.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      body: file
    });

    if (!uploadRes.ok) {
      throw new Error('Error al subir imagen a R2 (status: ' + uploadRes.status + ')');
    }

    return presigned.publicUrl;
  }
};


export const AuditService = {
  getAuditLogs: async (params?: {
    userId?: number | string;
    storeId?: number | string;
    actionType?: string;
    entityType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; number: number }> => {
    const query = new URLSearchParams();
    if (params?.userId) query.append('userId', String(params.userId));
    if (params?.storeId) query.append('storeId', String(params.storeId));
    if (params?.actionType) query.append('actionType', params.actionType);
    if (params?.entityType) query.append('entityType', params.entityType);
    if (params?.search) query.append('search', params.search);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    query.append('sort', 'createdAt,desc');

    const res = await fetch(`${API_URL}/admin/audit-logs?${query.toString()}`, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  }
};

export const RecruitmentService = {
  // --- Admin Endpoints ---
  getSummary: async (): Promise<RecruitmentSummary> => {
    const res = await fetch(`${API_URL}/recruitment/admin/summary`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  getAllVacancies: async (params?: { sede?: string; status?: string; search?: string }): Promise<JobVacancy[]> => {
    const query = new URLSearchParams();
    if (params?.sede) query.append('sede', params.sede);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${API_URL}/recruitment/admin/vacancies?${query.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  getVacancyById: async (id: number): Promise<JobVacancy> => {
    const res = await fetch(`${API_URL}/recruitment/admin/vacancies/${id}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  createVacancy: async (vacancy: JobVacancy): Promise<JobVacancy> => {
    const res = await fetch(`${API_URL}/recruitment/admin/vacancies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vacancy)
    });
    return await handleResponse(res);
  },

  updateVacancy: async (id: number, vacancy: JobVacancy): Promise<JobVacancy> => {
    const res = await fetch(`${API_URL}/recruitment/admin/vacancies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(vacancy)
    });
    return await handleResponse(res);
  },

  updateVacancyStatus: async (id: number, status: string): Promise<JobVacancy> => {
    const res = await fetch(`${API_URL}/recruitment/admin/vacancies/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await handleResponse(res);
  },

  deleteVacancy: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/recruitment/admin/vacancies/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  getApplications: async (params?: { vacancyId?: number; status?: string; search?: string }): Promise<JobApplication[]> => {
    const query = new URLSearchParams();
    if (params?.vacancyId) query.append('vacancyId', String(params.vacancyId));
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${API_URL}/recruitment/admin/applications?${query.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  getApplicationById: async (id: number): Promise<JobApplication> => {
    const res = await fetch(`${API_URL}/recruitment/admin/applications/${id}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  updateApplicationStatus: async (id: number, status: string, notes?: string): Promise<JobApplication> => {
    const res = await fetch(`${API_URL}/recruitment/admin/applications/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return await handleResponse(res);
  },

  rateCandidate: async (id: number, score: number, notes?: string): Promise<JobApplication> => {
    const res = await fetch(`${API_URL}/recruitment/admin/applications/${id}/score`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ score, notes })
    });
    return await handleResponse(res);
  },

  hireCandidate: async (id: number, data: any): Promise<JobApplication> => {
    const res = await fetch(`${API_URL}/recruitment/admin/applications/${id}/hire`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  deleteApplication: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/recruitment/admin/applications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  getInterviews: async (status?: string): Promise<JobInterview[]> => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    const res = await fetch(`${API_URL}/recruitment/admin/interviews?${query.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  scheduleInterview: async (interview: JobInterview): Promise<JobInterview> => {
    const res = await fetch(`${API_URL}/recruitment/admin/interviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(interview)
    });
    return await handleResponse(res);
  },

  updateInterviewStatus: async (id: number, status: string): Promise<JobInterview> => {
    const res = await fetch(`${API_URL}/recruitment/admin/interviews/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await handleResponse(res);
  },

  recordInterviewResult: async (id: number, result: string, notes?: string): Promise<JobInterview> => {
    const res = await fetch(`${API_URL}/recruitment/admin/interviews/${id}/result`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ result, notes })
    });
    return await handleResponse(res);
  },

  deleteInterview: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/recruitment/admin/interviews/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  // --- Public Endpoints ---
  getPublicActiveVacancies: async (): Promise<JobVacancy[]> => {
    const res = await fetch(`${API_URL}/recruitment/public/vacancies`);
    return await handleResponse(res, false);
  },

  getPublicVacancyById: async (id: number): Promise<JobVacancy> => {
    const res = await fetch(`${API_URL}/recruitment/public/vacancies/${id}`);
    return await handleResponse(res, false);
  },

  submitApplication: async (application: JobApplication): Promise<JobApplication> => {
    const res = await fetch(`${API_URL}/recruitment/public/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application)
    });
    return await handleResponse(res, false);
  },

  uploadResume: async (file: File): Promise<{ publicUrl: string; originalName: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch(`${API_URL}/recruitment/public/upload-resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: base64Data,
              name: file.name
            })
          });
          const result = await handleResponse(res, false);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  uploadDocument: async (file: File): Promise<{ publicUrl: string; originalName: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch(`${API_URL}/recruitment/public/upload-document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: base64Data,
              name: file.name
            })
          });
          const result = await handleResponse(res, false);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
};

export const TikTokService = {
  getAccounts: async (): Promise<import('../types').TikTokAccountStatus[]> => {
    const res = await fetch(`${API_URL}/tiktok/admin/accounts`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  validateAccount: async (username: string): Promise<{ valid: boolean; username: string; displayName: string; profileUrl: string }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/accounts/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username })
    });
    return await handleResponse(res);
  },

  linkAccount: async (data: {
    sedeId?: number;
    sedeName: string;
    username: string;
    displayName: string;
    accountId: string;
    avatarUrl?: string;
    accessToken?: string;
  }): Promise<any> => {
    const res = await fetch(`${API_URL}/tiktok/admin/accounts/link`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  disconnectAccount: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/accounts/${id}/disconnect`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  getSummary: async (sede?: string, period?: string): Promise<import('../types').TikTokSummary> => {
    const params = new URLSearchParams();
    if (sede && sede !== 'TODAS') params.append('sede', sede);
    if (period) params.append('period', period);
    const res = await fetch(`${API_URL}/tiktok/admin/summary?${params.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  getHistory: async (params: {
    sede?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    contentType?: string;
    page?: number;
    size?: number;
  }): Promise<{
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    page: number;
    size: number;
    totalPages: number;
    videos: import('../types').TikTokVideo[];
  }> => {
    const query = new URLSearchParams();
    if (params.sede && params.sede !== 'TODAS') query.append('sede', params.sede);
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);
    if (params.search) query.append('search', params.search);
    if (params.contentType && params.contentType !== 'TODOS') query.append('contentType', params.contentType);
    query.append('page', String(params.page || 0));
    query.append('size', String(params.size || 10));

    const res = await fetch(`${API_URL}/tiktok/admin/history?${query.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  getWeeklySchedule: async (sede?: string, weekStart?: string): Promise<import('../types').TikTokWeeklySchedule> => {
    const params = new URLSearchParams();
    if (sede && sede !== 'TODAS') params.append('sede', sede);
    if (weekStart) params.append('weekStart', weekStart);
    const res = await fetch(`${API_URL}/tiktok/admin/scheduled?${params.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  saveDayNote: async (data: { sedeName: string; date: string; note: string }): Promise<any> => {
    const res = await fetch(`${API_URL}/tiktok/admin/scheduled/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  syncScheduled: async (sede?: string, weekStart?: string): Promise<import('../types').TikTokWeeklySchedule> => {
    const params = new URLSearchParams();
    if (sede && sede !== 'TODAS') params.append('sede', sede);
    if (weekStart) params.append('weekStart', weekStart);
    const res = await fetch(`${API_URL}/tiktok/admin/scheduled/sync?${params.toString()}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  addScheduledVideo: async (video: Partial<import('../types').TikTokScheduledVideo>): Promise<import('../types').TikTokScheduledVideo> => {
    const res = await fetch(`${API_URL}/tiktok/admin/scheduled`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(video)
    });
    return await handleResponse(res);
  },

  deleteScheduledVideo: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/scheduled/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  getOAuthConfig: async (): Promise<{
    configured: boolean;
    clientKey: string | null;
    redirectUri: string;
    scopes: string[];
    requiredCredentials: Record<string, string>;
  }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/oauth/config`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  saveOAuthConfig: async (config: { clientKey: string; clientSecret: string; redirectUri?: string }): Promise<any> => {
    const res = await fetch(`${API_URL}/tiktok/admin/oauth/config`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    return await handleResponse(res);
  },

  getGlobalAccount: async (): Promise<{
    connected: boolean;
    id?: number;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    accountId?: string;
    openId?: string;
    status: string;
    connectedAt?: string;
    permissions?: string;
    scope?: string;
    canPublishDirectly?: boolean;
    canUploadDraft?: boolean;
    canListVideos?: boolean;
    tokenExpiresAt?: string;
  }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/account`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  disconnectGlobalAccount: async (): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/account/disconnect`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  publishVideo: async (formData: FormData): Promise<{
    success: boolean;
    publishId: string;
    status: string;
    isDraft: boolean;
    message: string;
  }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/publish`, {
      method: 'POST',
      headers: getAuthHeadersOnly(),
      body: formData
    });
    return await handleResponse(res);
  },

  scheduleVideo: async (formData: FormData): Promise<import('../types').TikTokScheduledVideo> => {
    const res = await fetch(`${API_URL}/tiktok/admin/schedule`, {
      method: 'POST',
      headers: getAuthHeadersOnly(),
      body: formData
    });
    return await handleResponse(res);
  },

  getAuthorizeUrl: async (sede?: string): Promise<{ url: string }> => {
    const params = new URLSearchParams();
    if (sede && sede !== 'TODAS') params.append('sede', sede);
    const res = await fetch(`${API_URL}/tiktok/admin/oauth/authorize-url?${params.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  },

  handleOAuthCallback: async (code: string, sede: string): Promise<any> => {
    const res = await fetch(`${API_URL}/tiktok/admin/oauth/callback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, sede })
    });
    return await handleResponse(res);
  },

  syncVideos: async (): Promise<{ success: boolean; count?: number; message?: string }> => {
    const res = await fetch(`${API_URL}/tiktok/admin/videos/sync`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  getAnalytics: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    specificDate?: string;
  }): Promise<{
    isLinked: boolean;
    accountUsername: string;
    accountDisplayName: string;
    totalAllVideos: number;
    totalPeriodVideos: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    engagementRate: number;
    avgViewsPerVideo: number;
    avgLikesPerVideo: number;
    filterFrom: string;
    filterTo: string;
    topViralVideos: import('../types').TikTokVideo[];
    mostViralWeek: {
      weekStart?: string;
      weekEnd?: string;
      label?: string;
      totalViews?: number;
      totalLikes?: number;
      videoCount?: number;
    };
    mostViralMonth: {
      yearMonth?: string;
      monthName?: string;
      totalViews?: number;
      totalLikes?: number;
      videoCount?: number;
    };
    timeline: Array<{
      date: string;
      videos: number;
      views: number;
      likes: number;
      comments: number;
    }>;
    videos: import('../types').TikTokVideo[];
  }> => {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.specificDate) query.append('specificDate', params.specificDate);
    const res = await fetch(`${API_URL}/tiktok/admin/analytics?${query.toString()}`, { headers: getHeaders() });
    return await handleResponse(res);
  }
};

