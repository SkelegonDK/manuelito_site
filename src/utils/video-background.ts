/**
 * Video Background Manager
 * Handles video background loading, placeholder management, and view transitions
 * Extracted from BaseLayout.astro for better modularity and performance
 */

export interface VideoBackgroundConfig {
  videoId?: string;
  placeholderId?: string;
  fadeDuration?: number;
  fallbackTimeout?: number;
  loadDelay?: number;
}

export class VideoBackgroundManager {
  private video: HTMLVideoElement | null = null;
  private placeholder: HTMLDivElement | null = null;
  private config: VideoBackgroundConfig;
  private isInitialized = false;
  private isVideoLoading = false;
  private cleanupFunctions: (() => void)[] = [];

  constructor(config: VideoBackgroundConfig = {}) {
    this.config = {
      videoId: 'bgvid',
      placeholderId: 'video-placeholder',
      fadeDuration: 500,
      fallbackTimeout: 3000,
      loadDelay: 100,
      ...config
    };
  }

  /**
   * Initialize video background functionality
   */
  init(): void {
    if (this.isInitialized) return;

    // Progressive loading: delay non-critical video operations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.initializeVideoBackground();
      }, { timeout: 1000 });
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        this.initializeVideoBackground();
      }, 500);
    }
  }

  /**
   * Initialize video background (separated for progressive loading)
   */
  private initializeVideoBackground(): void {
    if (this.isInitialized) return;

    try {
      this.video = document.getElementById(this.config.videoId!) as HTMLVideoElement;
      this.placeholder = document.getElementById(this.config.placeholderId!) as HTMLDivElement;

      if (!this.video || !this.placeholder) {
        console.warn('VideoBackgroundManager: Required elements not found');
        return;
      }

      this.setupVideoLoading();
      this.setupViewTransitions();
      this.isInitialized = true;
    } catch (error) {
      console.error('VideoBackgroundManager initialization failed:', error);
    }
  }

  /**
   * Safely load video only once to prevent duplicate downloads
   */
  private safeLoadVideo(): void {
    if (!this.video || this.isVideoLoading) return;
    
    this.isVideoLoading = true;
    
    // Only load if the video hasn't started loading yet
    if (this.video.readyState === 0) {
      this.video.load();
    }
    
    // Reset loading state after a short delay
    setTimeout(() => {
      this.isVideoLoading = false;
    }, 1000);
  }

  /**
   * Setup video loading and placeholder management
   */
  private setupVideoLoading(): void {
    if (!this.video || !this.placeholder) return;

    // Check if video was already ready from previous navigation
    const wasVideoReady = sessionStorage.getItem('videoReady') === 'true';
    
    if (wasVideoReady) {
      // Video was already ready, hide placeholder immediately
      this.hidePlaceholderPermanently();
      return;
    }

    // Show placeholder initially
    this.placeholder.style.opacity = '1';

    // Create placeholder hiding function with permanent hiding
    const hidePlaceholder = () => {
      this.hidePlaceholderPermanently();
    };

    // Listen for video ready events with multiple fallbacks
    const onCanPlayThrough = () => hidePlaceholder();
    const onLoadedData = () => hidePlaceholder();
    const onCanPlay = () => hidePlaceholder();

    this.video.addEventListener('canplaythrough', onCanPlayThrough);
    this.video.addEventListener('loadeddata', onLoadedData);
    this.video.addEventListener('canplay', onCanPlay);

    // Store cleanup functions
    this.cleanupFunctions.push(
      () => this.video?.removeEventListener('canplaythrough', onCanPlayThrough),
      () => this.video?.removeEventListener('loadeddata', onLoadedData),
      () => this.video?.removeEventListener('canplay', onCanPlay)
    );

    // Fallback: hide placeholder after timeout regardless
    const fallbackTimeout = setTimeout(hidePlaceholder, this.config.fallbackTimeout!);
    this.cleanupFunctions.push(() => clearTimeout(fallbackTimeout));

    // Ensure video starts playing
    this.ensureVideoPlayback();
  }

  /**
   * Ensure video is playing and handle autoplay restrictions
   */
  private ensureVideoPlayback(): void {
    if (!this.video) return;

    // Check if video is already playing
    if (!this.video.paused) return;

    // Try to play the video
    const playPromise = this.video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.debug('Video background started playing successfully');
        })
        .catch((error) => {
          console.warn('Video autoplay failed, will retry on user interaction:', error);
          
          // Set up a one-time listener for user interaction to start video
          const startVideoOnInteraction = () => {
            this.video?.play().catch(() => {
              // Ignore autoplay failures
            });
            document.removeEventListener('click', startVideoOnInteraction);
            document.removeEventListener('touchstart', startVideoOnInteraction);
            document.removeEventListener('keydown', startVideoOnInteraction);
          };

          document.addEventListener('click', startVideoOnInteraction, { once: true });
          document.addEventListener('touchstart', startVideoOnInteraction, { once: true });
          document.addEventListener('keydown', startVideoOnInteraction, { once: true });
        });
    }
  }

  /**
   * Permanently hide placeholder and mark video as ready
   */
  private hidePlaceholderPermanently(): void {
    if (!this.placeholder) return;
    
    // Hide placeholder permanently
    this.placeholder.style.opacity = '0';
    this.placeholder.style.display = 'none';
    
    // Mark video as ready in session storage to prevent placeholder from reappearing
    if ('sessionStorage' in window) {
      try {
        sessionStorage.setItem('videoReady', 'true');
      } catch (error) {
        console.warn('Failed to store video ready state:', error);
      }
    }
  }

  /**
   * Setup optimized Astro view transition handlers for 60fps performance
   */
  private setupViewTransitions(): void {
    if (!this.video) return;

    let transitionInProgress = false;
    let saveTimeoutId: number | null = null;

    // Optimized handler with debouncing and RAF for 60fps
    const beforeSwapHandler = () => {
      if (transitionInProgress) return;
      transitionInProgress = true;

      // Use RAF to ensure smooth timing
      requestAnimationFrame(() => {
        if (this.video && 'sessionStorage' in window) {
          try {
            // Debounce storage operations to prevent excessive writes
            if (saveTimeoutId) {
              clearTimeout(saveTimeoutId);
            }
            
            saveTimeoutId = window.setTimeout(() => {
              if (this.video) {
                sessionStorage.setItem('videoTime', this.video.currentTime.toString());
              }
            }, 16); // ~60fps timing
          } catch (error) {
            console.warn('Failed to store video time:', error);
          }
        }
      });
    };

    // Optimized restore handler with RAF and state management
    const afterSwapHandler = () => {
      if (!this.video) {
        transitionInProgress = false;
        return;
      }

      // Use RAF for smooth video restoration
      requestAnimationFrame(() => {
        if (!this.video) {
          transitionInProgress = false;
          return;
        }

        try {
          // Use the new restore method for better state management
          this.restoreVideoState();
        } catch (error) {
          console.warn('Failed to restore video state:', error);
        } finally {
          // Reset transition state after a frame
          requestAnimationFrame(() => {
            transitionInProgress = false;
          });
        }
      });
    };

    document.addEventListener('astro:before-swap', beforeSwapHandler);
    document.addEventListener('astro:after-swap', afterSwapHandler);

    // Store cleanup functions
    this.cleanupFunctions.push(
      () => {
        document.removeEventListener('astro:before-swap', beforeSwapHandler);
        document.removeEventListener('astro:after-swap', afterSwapHandler);
        if (saveTimeoutId) {
          clearTimeout(saveTimeoutId);
        }
      }
    );
  }

  /**
   * Cleanup all event listeners and timers
   */
  destroy(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    this.isInitialized = false;
    this.video = null;
    this.placeholder = null;
  }

  /**
   * Get current video element
   */
  getVideo(): HTMLVideoElement | null {
    return this.video;
  }

  /**
   * Get current placeholder element
   */
  getPlaceholder(): HTMLDivElement | null {
    return this.placeholder;
  }

  /**
   * Check if manager is initialized
   */
  isReady(): boolean {
    return this.isInitialized && !!this.video && !!this.placeholder;
  }

  /**
   * Check if video was ready from previous navigation
   */
  wasVideoReady(): boolean {
    if (!('sessionStorage' in window)) return false;
    
    try {
      return sessionStorage.getItem('videoReady') === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Restore video state from session storage
   */
  restoreVideoState(): void {
    if (!this.video) return;

    try {
      // Check if video was already ready
      const wasReady = this.wasVideoReady();
      
      if (wasReady && this.placeholder) {
        // Ensure placeholder stays hidden
        this.placeholder.style.display = 'none';
        this.placeholder.style.opacity = '0';
      }

      // Restore video time if available
      if ('sessionStorage' in window) {
        const storedTime = sessionStorage.getItem('videoTime');
        if (storedTime) {
          const time = parseFloat(storedTime);
          if (!isNaN(time) && Math.abs(this.video.currentTime - time) > 0.1) {
            this.video.currentTime = time;
          }
        }
      }

      // Ensure video is playing
      if (this.video.paused) {
        this.ensureVideoPlayback();
      }
    } catch (error) {
      console.warn('Failed to restore video state:', error);
    }
  }

  /**
   * Get current video state for testing and debugging
   */
  getVideoState(): {
    videoExists: boolean;
    videoPlaying: boolean;
    placeholderVisible: boolean;
    videoTime: number;
    wasReady: boolean;
  } {
    const videoExists = !!this.video;
    const videoPlaying = this.video ? !this.video.paused : false;
    const placeholderVisible = this.placeholder ? 
      this.placeholder.style.display !== 'none' && parseFloat(this.placeholder.style.opacity || '0') > 0 : false;
    const videoTime = this.video ? this.video.currentTime : 0;
    const wasReady = this.wasVideoReady();

    return {
      videoExists,
      videoPlaying,
      placeholderVisible,
      videoTime,
      wasReady
    };
  }

  /**
   * Force video playback for testing purposes
   */
  forcePlay(): Promise<void> {
    if (!this.video) return Promise.reject(new Error('No video element'));
    
    return this.video.play().catch((error) => {
      console.warn('Failed to force play video:', error);
      throw error;
    });
  }

  /**
   * Check if video element exists and is properly configured
   */
  isVideoElementReady(): boolean {
    if (!this.video) return false;
    
    // Check if video element has the required attributes
    const hasSrc = !!(this.video.src || this.video.querySelector('source'));
    const hasAutoplay = !!this.video.autoplay;
    
    return hasSrc && hasAutoplay;
  }
}

/**
 * Factory function for easy initialization
 */
export function createVideoBackgroundManager(config?: VideoBackgroundConfig): VideoBackgroundManager {
  return new VideoBackgroundManager(config);
}

/**
 * Initialize video background with default settings
 */
export function initVideoBackground(config?: VideoBackgroundConfig): VideoBackgroundManager {
  const manager = new VideoBackgroundManager(config);
  manager.init();
  return manager;
}
