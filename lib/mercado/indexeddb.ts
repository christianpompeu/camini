/**
 * CAMINI MERCADO — Camada de Persistência Offline IndexedDB + Fallback LocalStorage
 * 
 * Permite armazenamento local ilimitado para carrinhos, itens e fotos de produtos/cupons,
 * sem estourar o limite rígido de 5MB do LocalStorage.
 */

import { MercadoCarrinho } from "@/types/mercado";

const DB_NAME = "camini_mercado_db";
const DB_VERSION = 1;
const STORE_NAME = "carrinhos";
const LOCAL_STORAGE_KEY = "camini_mercado_carrinhos_v1";

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn("[MERCADO] Falha ao abrir IndexedDB. Usando fallback LocalStorage.");
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Salva a lista completa de carrinhos no IndexedDB (e espelha no localStorage para redundância).
 */
export async function saveCarrinhosToStorage(carrinhos: MercadoCarrinho[]): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Tentar IndexedDB primeiro (suporta fotos em base64 sem limite de 5MB)
  const db = await openDatabase();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        // Limpar e reinserir todos
        const clearReq = store.clear();
        clearReq.onsuccess = () => {
          if (carrinhos.length === 0) {
            resolve();
            return;
          }
          let completed = 0;
          carrinhos.forEach((c) => {
            const putReq = store.put(c);
            putReq.onsuccess = () => {
              completed++;
              if (completed === carrinhos.length) resolve();
            };
            putReq.onerror = () => reject(putReq.error);
          });
        };
        clearReq.onerror = () => reject(clearReq.error);

        tx.onabort = () => reject(tx.error);
      });
    } catch (err) {
      console.warn("[MERCADO] Erro ao gravar no IndexedDB:", err);
    }
  }

  // 2. Espelho leve no LocalStorage (removendo fotos pesadas caso ultrapasse limites)
  try {
    const lightCopy = carrinhos.map((c) => ({
      ...c,
      fotoCupom: c.fotoCupom && c.fotoCupom.length > 500 ? "[indexeddb_saved]" : c.fotoCupom,
      itens: c.itens.map((it) => ({
        ...it,
        fotoProduto: it.fotoProduto && it.fotoProduto.length > 500 ? "[indexeddb_saved]" : it.fotoProduto,
      })),
    }));
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightCopy));
  } catch (err) {
    console.warn("[MERCADO] LocalStorage cheio ou restrito:", err);
  }
}

/**
 * Carrega todos os carrinhos do IndexedDB ou do LocalStorage (fallback).
 */
export async function loadCarrinhosFromStorage(): Promise<MercadoCarrinho[]> {
  if (typeof window === "undefined") return [];

  // 1. Tentar ler do IndexedDB
  const db = await openDatabase();
  if (db) {
    try {
      const records = await new Promise<MercadoCarrinho[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          resolve(req.result || []);
        };
        req.onerror = () => reject(req.error);
      });

      if (records && records.length > 0) {
        // Ordenar pelo criadoEm decrescente
        return records.sort(
          (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        );
      }
    } catch (err) {
      console.warn("[MERCADO] Erro ao ler do IndexedDB, tentando LocalStorage:", err);
    }
  }

  // 2. Fallback para LocalStorage
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MercadoCarrinho[];
      return parsed.sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );
    }
  } catch (err) {
    console.error("[MERCADO] Erro ao carregar carrinhos do LocalStorage:", err);
  }

  return [];
}
