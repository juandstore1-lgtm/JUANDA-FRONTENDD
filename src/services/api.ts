import { User, Store, Category, Product, HeroSlide, RouletteSetting, MysteryBoxSetting, Contest, ContestParticipant, ContestWinner, HomeCategoryCollection } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://juanda-backend-production.up.railway.app/api';

const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const msg = error.message || error.error || error.detail || `Error (${res.status}): No se pudo completar la solicitud`;
    throw new Error(msg);
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

let storesCache: Store[] | null = null;

export const StoreService = {
  getStores: async (): Promise<Store[]> => {
    if (storesCache) return storesCache;
    const res = await fetch(`${API_URL}/sedes`, { headers: getHeaders() });
    const data = await handleResponse(res);
    storesCache = data.map((s: any) => ({
      ...s,
      id: String(s.id)
    }));
    return storesCache!;
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

export const UserService = {
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    const data = await handleResponse(res).catch(() => []);
    return data.map((u: any) => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      role: { id: u.roleName === 'GLOBAL_ADMIN' ? 'r1' : 'r2', name: u.roleName },
      storeIds: u.storeIds ? u.storeIds.map(String) : [],
      isActive: !!u.isActive
    }));
  },
  
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
    return handleResponse(res);
  },
  
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },
  
  deleteUser: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  },
  
  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
    const u = await handleResponse(res);
    return {
      id: String(u.id),
      name: u.name,
      email: u.email,
      role: { id: u.roleName === 'GLOBAL_ADMIN' ? 'r1' : 'r2', name: u.roleName },
      storeIds: u.storeIds ? u.storeIds.map(String) : [],
      isActive: !!u.isActive
    };
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
  getCategories: async (storeId?: string | number): Promise<Category[]> => {
    const url = storeId ? `${API_URL}/categories?storeId=${storeId}` : `${API_URL}/categories`;
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
      const resAll = await fetch(`${API_URL}/contests/admin/all`);
      if (resAll.ok) {
        const list = await resAll.json();
        if (Array.isArray(list) && list.length > 0) {
          return list.sort((a: any, b: any) => b.id - a.id)[0];
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
    return await handleResponse(res);
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

export const TicketService = {
  getTicketsByRaffle: async (raffleId: string): Promise<any[]> => {
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets`);
    const data = await handleResponse(res);
    return data.map((d: any) => ({ 
      ...d, 
      id: String(d.id),
      raffleId: String(d.raffleId)
    }));
  },
  purchaseTickets: async (raffleId: string, request: any): Promise<void> => {
    const payload = {
      ticketIds: request.ticketIds.map((id: string) => Number(id)),
      buyer: request.buyer
    };
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    await handleResponse(res);
  },
  approveTicket: async (raffleId: string, ticketId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets/${ticketId}/approve`, {
      method: 'PUT',
      headers: getHeaders()
    });
    await handleResponse(res);
  },
  cancelTicket: async (raffleId: string, ticketId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/raffles/${raffleId}/tickets/${ticketId}/cancel`, {
      method: 'PUT',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};
