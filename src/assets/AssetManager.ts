/** 素材管理：预加载、缓存、错误处理（缺失不崩溃，返回 undefined 由渲染层画占位）。 */
import { collectImageUrls } from '../config/assets';
import { CUSTOM_ASSETS } from '../config/customAssets';

export interface AssetManifest {
  images: Record<string, string>;
  audio: Record<string, string>;
}

export class AssetManager {
  private images = new Map<string, HTMLImageElement>();
  private loaded = 0;
  private total = 0;

  get totalCount(): number {
    return this.total;
  }

  get loadedCount(): number {
    return this.loaded;
  }

  async preload(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    const urls = this.collectUrls();
    this.total = urls.length;
    this.loaded = 0;
    await Promise.all(urls.map((url) => this.load(url, onProgress)));
  }

  private collectUrls(): string[] {
    const set = new Set<string>(collectImageUrls());
    const walk = (obj: unknown): void => {
      if (typeof obj === 'string') {
        set.add(obj);
        return;
      }
      if (obj && typeof obj === 'object') {
        for (const v of Object.values(obj as Record<string, unknown>)) walk(v);
      }
    };
    walk(CUSTOM_ASSETS);
    return [...set];
  }

  private load(url: string, onProgress?: (loaded: number, total: number) => void): Promise<void> {
    return new Promise((resolve) => {
      if (this.images.has(url)) {
        this.loaded += 1;
        onProgress?.(this.loaded, this.total);
        resolve();
        return;
      }
      const img = new Image();
      img.onload = (): void => {
        this.images.set(url, img);
        this.loaded += 1;
        onProgress?.(this.loaded, this.total);
        resolve();
      };
      img.onerror = (): void => {
        console.error(`[AssetManager] 素材加载失败，将使用占位图: ${url}`);
        this.loaded += 1;
        onProgress?.(this.loaded, this.total);
        resolve();
      };
      img.src = url;
    });
  }

  /** 按 URL 获取缓存图片；不存在返回 undefined */
  get(url: string): HTMLImageElement | undefined {
    return this.images.get(url);
  }

  clear(): void {
    this.images.clear();
    this.loaded = 0;
    this.total = 0;
  }
}
