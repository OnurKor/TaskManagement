import { useState } from "react";
import axios from "axios";
import type { Method } from "axios";
import api from '../utils/axiosConfig'; // Mevcut axios instance'ı

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase’e istek atmak için tekrar kullanılabilir bir request fonksiyonu

export interface RequestOptions {
  method?: Method;
  body?: any;
  headers?: Record<string, string>;
  useAuth?: boolean; // Token gerektiren istekler için
}

export function useSupabaseApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | Error | unknown>(null);
  const [data, setData] = useState<T | null>(null);

  const request = async (endpoint: string, options: RequestOptions = {}) => {
    // Önceki isteğin hala devam ettiği durumlarda yeni istek yapmayı engelle
    if (loading) {
      console.log('Önceki istek devam ediyor, yeni istek engellendi');
      return { data: null, error: new Error('Previous request still in progress') };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`API request to ${endpoint} started`);
      // Token gerektiren istekler için mevcut axios instance'ı kullan
      if (options.useAuth) {
        // Bu instance zaten token interceptor'larına sahip
        const response = await api({
          url: `/rest/v1/${endpoint}`,
          method: options.method || "GET",
          headers: {
            apikey: SUPABASE_API_KEY, // API key'i token'a ek olarak ekle
            ...options.headers,
          },
          data: options.body || undefined,
        });
        
        console.log(`API response from ${endpoint}:`, response.data);
        setData(response.data as T);
        return { data: response.data as T, error: null };
      } else {
        // Anonim istekler için basit axios kullan
        const response = await axios({
          url: `${SUPABASE_URL}/rest/v1/${endpoint}`,
          method: options.method || "GET",
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
          data: options.body || undefined,
        });
        
        console.log(`API response from ${endpoint}:`, response.data);
        setData(response.data as T);
        return { data: response.data as T, error: null };
      }
    } catch (err: any) {
      console.error(`API error from ${endpoint}:`, err);
      setError(err.response?.data || err.message || err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { request, data, error, loading, resetState };
}