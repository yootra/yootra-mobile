import { useEffect } from 'react';
import { 
  createRouter, 
  createRoute, 
  createRootRoute, 
  Outlet, 
  useRouter,
  useLocation 
} from '@tanstack/react-router';
import { App as CapacitorApp } from '@capacitor/app';
import { Toast } from '@capacitor/toast';

import { BottomNav } from './components/BottomNav';
import { CreatorSupportBottomSheet } from './components/CreatorSupportBottomSheet';
import { VpnRequiredModal } from './components/VpnRequiredModal';
import { useAppContext } from './context/AppContext';

// Pages
import { HomeView } from './pages/Home';
import { VideoPreviewView } from './pages/Preview';
import { DownloadingView } from './pages/Downloading';
import { DownloadsHistory } from './pages/Downloads';
import { SettingsView } from './pages/Settings';

const RootLayout = () => {
  const router = useRouter();
  const { 
    isBottomSheetOpen, setIsBottomSheetOpen, handleConfirmDownload,
    isVpnModalOpen, setIsVpnModalOpen 
  } = useAppContext();

  useEffect(() => {
    let lastBackPress = 0;

    const backButtonListener = CapacitorApp.addListener('backButton', () => {
      // 1. Check for open Modals/Dialogs
      const openDialogs = document.querySelectorAll('dialog[open]');
      if (openDialogs.length > 0) {
        const topmostDialog = openDialogs[openDialogs.length - 1] as HTMLDialogElement;
        topmostDialog.close();
        
        // Also manually update context states just in case
        if (isBottomSheetOpen) setIsBottomSheetOpen(false);
        if (isVpnModalOpen) setIsVpnModalOpen(false);
        return;
      }

      // 2. Check if we can go back in router history (if not on root tabs)
      const currentPath = router.state.location.pathname;
      const rootTabs = ['/', '/downloads', '/settings'];
      
      if (!rootTabs.includes(currentPath)) {
        router.history.back();
        return;
      }

      // 3. Double tap to exit on root tabs
      const now = Date.now();
      if (now - lastBackPress < 2000) {
        CapacitorApp.exitApp();
      } else {
        lastBackPress = now;
        Toast.show({ text: 'برای خروج دوباره دکمه بازگشت را بزنید', duration: 'short' }).catch(console.log);
      }
    });

    return () => {
      backButtonListener.then((listener: any) => listener.remove());
    };
  }, [router, isBottomSheetOpen, isVpnModalOpen, setIsBottomSheetOpen, setIsVpnModalOpen]);

  const location = useLocation();
  const currentPath = location.pathname;
  const showBottomNav = ['/', '/downloads', '/settings'].includes(currentPath);

  // Derive active tab for BottomNav
  let activeTab = 'home';
  if (currentPath === '/downloads') activeTab = 'downloads';
  if (currentPath === '/settings') activeTab = 'settings';

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col pb-20 safe-top">
      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-3">
        <Outlet />
      </main>

      <CreatorSupportBottomSheet
        isOpen={isBottomSheetOpen}
        onConfirm={async () => {
          await handleConfirmDownload();
          router.navigate({ to: '/downloading' });
        }}
        onCancel={() => setIsBottomSheetOpen(false)}
      />

      <VpnRequiredModal
        isOpen={isVpnModalOpen}
        onClose={() => setIsVpnModalOpen(false)}
      />

      {showBottomNav && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            const path = tab === 'home' ? '/' : `/${tab}`;
            router.navigate({ to: path });
          }}
        />
      )}
    </div>
  );
};

const rootRoute = createRootRoute({
  component: RootLayout
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const { 
      handleFetchInfo, isFetchingInfo, downloads 
    } = useAppContext();
    const router = useRouter();

    return (
      <HomeView
        onFetchInfo={async (url) => {
          try {
            await handleFetchInfo(url);
            router.navigate({ to: '/preview' });
          } catch (e) {
            // AppContext handles the toast and modal
          }
        }}
        isLoading={isFetchingInfo}
        recentDownloads={downloads}
        onViewAllDownloads={() => router.navigate({ to: '/downloads' })}
        onSelectRecent={(item) => {
          if (item.status === 'downloading') {
            router.navigate({ to: '/downloading' });
          } else {
            router.navigate({ to: '/downloads' });
          }
        }}
        onOpenActiveDownloading={() => {
          router.navigate({ to: '/downloading' });
        }}
      />
    );
  }
});

const previewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/preview',
  component: () => {
    const { videoInfo, handleRequestDownload, activeDownload } = useAppContext();
    const router = useRouter();
    
    if (!videoInfo) {
      router.navigate({ to: '/' });
      return null;
    }

    return (
      <VideoPreviewView
        videoInfo={videoInfo}
        onBack={() => router.navigate({ to: '/' })}
        onRequestDownload={handleRequestDownload}
        isDownloading={!!activeDownload}
      />
    );
  }
});

const downloadingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/downloading',
  component: () => {
    const { downloads, activeDownload, videoInfo, handleCancelDownload } = useAppContext();
    const router = useRouter();

    // The logic originally passed in App.tsx
    const item = activeDownload || downloads[0] || {
      id: 'demo',
      url: '',
      title: videoInfo?.title || 'YouTube Video',
      thumbnail: videoInfo?.thumbnail || '',
      formatId: '720p',
      qualityLabel: '720p (HD)',
      ext: 'mp4',
      progress: 0,
      speed: '0 MB/s',
      eta: '-1',
      status: 'downloading',
      timestamp: Date.now(),
      fileSize: 0
    };

    return (
      <DownloadingView
        item={item as any}
        onBack={() => router.navigate({ to: '/' })}
        onCancel={async (id) => {
          await handleCancelDownload(id);
          router.navigate({ to: '/' });
        }}
      />
    );
  }
});

const downloadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/downloads',
  component: () => {
    const { downloads, handleDeleteDownload } = useAppContext();
    const router = useRouter();

    return (
      <DownloadsHistory
        downloads={downloads}
        onDelete={handleDeleteDownload}
        onOpenHomeUrlInput={() => router.navigate({ to: '/' })}
        onOpenDownloading={() => router.navigate({ to: '/downloading' })}
      />
    );
  }
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => {
    const { settings, updateSettings, changeLanguage } = useAppContext();

    return (
      <SettingsView
        settings={settings}
        onUpdateSettings={updateSettings}
        onLanguageChange={changeLanguage}
      />
    );
  }
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  previewRoute,
  downloadingRoute,
  downloadsRoute,
  settingsRoute
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
