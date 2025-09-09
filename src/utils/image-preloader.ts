/**
 * Image Preloader with Intersection Observer
 * Efficiently preloads images based on element visibility instead of hover events
 * Provides better performance and user experience
 */

export interface ImagePreloaderConfig {
  rootMargin?: string;
  threshold?: number | number[];
  enableHoverPreload?: boolean;
  preloadAttribute?: string;
  triggerClass?: string;
}

export interface PreloadedImage {
  src: string;
  element: HTMLImageElement;
  loaded: boolean;
  loading: boolean;
}

export class ImagePreloader {
  private observer: IntersectionObserver | null = null;
  private config: ImagePreloaderConfig;
  private preloadedImages = new Map<string, PreloadedImage>();
  private observedElements = new WeakSet<Element>();
  private isInitialized = false;

  constructor(config: ImagePreloaderConfig = {}) {
    this.config = {
      rootMargin: '50px',
      threshold: 0.1,
      enableHoverPreload: true,
      preloadAttribute: 'data-preload-src',
      triggerClass: 'preload-trigger',
      ...config
    };
  }

  /**
   * Initialize the image preloader
   */
  init(): void {
    if (this.isInitialized) return;

    // Progressive loading: delay non-critical image preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.initializeImagePreloader();
      }, { timeout: 1500 });
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        this.initializeImagePreloader();
      }, 1000);
    }
  }

  /**
   * Initialize image preloader (separated for progressive loading)
   */
  private initializeImagePreloader(): void {
    if (this.isInitialized) return;

    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to hover preloading');
      this.setupLegacyHoverPreloading();
      return;
    }

    try {
      this.setupIntersectionObserver();
      this.observeElements();
      
      if (this.config.enableHoverPreload) {
        this.setupHoverPreloading();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('ImagePreloader initialization failed:', error);
      this.setupLegacyHoverPreloading();
    }
  }

  /**
   * Setup Intersection Observer with optimized configuration
   */
  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null, // Use viewport as root
      rootMargin: this.config.rootMargin!,
      threshold: this.config.threshold!
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.preloadImagesInElement(entry.target);
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);
  }

  /**
   * Find and observe all elements with preload triggers
   */
  private observeElements(): void {
    if (!this.observer) return;

    const triggers = document.querySelectorAll(`.${this.config.triggerClass}`);
    
    triggers.forEach(trigger => {
      if (!this.observedElements.has(trigger)) {
        this.observer!.observe(trigger);
        this.observedElements.add(trigger);
      }
    });
  }

  /**
   * Preload images within a specific element
   */
  private preloadImagesInElement(element: Element): void {
    const preloadImages = element.querySelectorAll(`[${this.config.preloadAttribute}]`);
    
    preloadImages.forEach(img => {
      const imgElement = img as HTMLImageElement;
      const src = imgElement.getAttribute(this.config.preloadAttribute!);
      
      if (src && !this.preloadedImages.has(src)) {
        this.preloadImage(src, imgElement);
      }
    });
  }

  /**
   * Preload a single image with caching and error handling
   */
  private preloadImage(src: string, targetElement?: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Check if already loaded or loading
      const cached = this.preloadedImages.get(src);
      if (cached?.loaded) {
        if (targetElement && !targetElement.src) {
          targetElement.src = src;
        }
        resolve(cached.element);
        return;
      }

      if (cached?.loading) {
        // Already loading, wait for completion
        cached.element.addEventListener('load', () => resolve(cached.element));
        cached.element.addEventListener('error', reject);
        return;
      }

      // Create new image for preloading
      const preloader = new Image();
      const preloadData: PreloadedImage = {
        src,
        element: preloader,
        loaded: false,
        loading: true
      };

      this.preloadedImages.set(src, preloadData);

      preloader.onload = () => {
        preloadData.loaded = true;
        preloadData.loading = false;
        
        // Set src on target element if provided and not already set
        if (targetElement && !targetElement.src) {
          targetElement.src = src;
        }
        
        resolve(preloader);
      };

      preloader.onerror = (error) => {
        preloadData.loading = false;
        this.preloadedImages.delete(src);
        console.warn(`Failed to preload image: ${src}`, error);
        reject(error);
      };

      // Start loading
      preloader.src = src;
    });
  }

  /**
   * Setup hover-based preloading as additional optimization
   */
  private setupHoverPreloading(): void {
    const triggers = document.querySelectorAll(`.${this.config.triggerClass}`);
    
    triggers.forEach(trigger => {
      const handleMouseEnter = () => {
        this.preloadImagesInElement(trigger);
      };

      trigger.addEventListener('mouseenter', handleMouseEnter, { once: true });
    });
  }

  /**
   * Legacy hover preloading for browsers without IntersectionObserver
   */
  private setupLegacyHoverPreloading(): void {
    const triggers = document.querySelectorAll(`.${this.config.triggerClass}`);
    
    triggers.forEach(trigger => {
      const preloadImages = trigger.querySelectorAll(`[${this.config.preloadAttribute}]`);
      
      if (preloadImages.length === 0) return;
      
      trigger.addEventListener('mouseenter', () => {
        preloadImages.forEach(img => {
          const imgElement = img as HTMLImageElement;
          const src = imgElement.getAttribute(this.config.preloadAttribute!);
          
          if (src && !imgElement.src && !this.preloadedImages.has(src)) {
            this.preloadImage(src, imgElement);
          }
        });
      });
    });
  }

  /**
   * Add new elements to observation (useful for dynamically added content)
   */
  observeNewElements(): void {
    if (this.isInitialized && this.observer) {
      this.observeElements();
    }
  }

  /**
   * Manually preload specific images
   */
  async preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    const promises = sources.map(src => this.preloadImage(src));
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
      return [];
    }
  }

  /**
   * Check if an image is already preloaded
   */
  isImagePreloaded(src: string): boolean {
    return this.preloadedImages.get(src)?.loaded || false;
  }

  /**
   * Get preload statistics
   */
  getStats(): { total: number; loaded: number; loading: number } {
    let loaded = 0;
    let loading = 0;
    
    this.preloadedImages.forEach(img => {
      if (img.loaded) loaded++;
      else if (img.loading) loading++;
    });
    
    return {
      total: this.preloadedImages.size,
      loaded,
      loading
    };
  }

  /**
   * Clear all preloaded images from memory
   */
  clearCache(): void {
    this.preloadedImages.clear();
  }

  /**
   * Cleanup and destroy the preloader
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.clearCache();
    this.observedElements = new WeakSet();
    this.isInitialized = false;
  }
}

/**
 * Factory function for easy initialization
 */
export function createImagePreloader(config?: ImagePreloaderConfig): ImagePreloader {
  return new ImagePreloader(config);
}

/**
 * Initialize image preloader with default settings
 */
export function initImagePreloader(config?: ImagePreloaderConfig): ImagePreloader {
  const preloader = new ImagePreloader(config);
  preloader.init();
  return preloader;
}

/**
 * Utility function to preload images immediately
 */
export async function preloadImagesNow(sources: string[]): Promise<HTMLImageElement[]> {
  const preloader = new ImagePreloader();
  return preloader.preloadImages(sources);
}
