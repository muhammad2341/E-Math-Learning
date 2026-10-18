<template>
  <div
    class="dashboard-layout"
    :class="{ 'sidebar-open': isMobileOpen && !isDesktop, 'sidebar-collapsed': isCollapsed && isDesktop }"
  >
    <!-- Sidebar -->
    <aside
      class="dashboard-sidebar"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <h1 class="font-bold text-gray-900 text-sm">E-Math Learn</h1>
          <p class="text-xs text-gray-400">Platform Edukasi</p>
        </div>
        <button
          v-if="isDesktop"
          class="collapse-btn"
          title="Sembunyikan sidebar"
          @click="isCollapsed = true"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button v-else class="close-btn" @click="isMobileOpen = false">✕</button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: $route.path === item.to }"
          @click="isMobileOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-box">
          <p class="text-xs font-semibold text-gray-900 truncate">{{ authStore.user?.name }}</p>
          <p class="text-[10px] text-gray-500 uppercase">{{ authStore.user?.role }}</p>
        </div>
      </div>
    </aside>

    <!-- Overlay mobile -->
    <div v-if="isMobileOpen && !isDesktop" class="sidebar-overlay" @click="isMobileOpen = false" />

    <!-- Main content -->
    <div class="dashboard-content">
      <header class="content-header">
        <button v-if="!isDesktop" class="hamburger" @click="isMobileOpen = true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          v-if="isDesktop && isCollapsed"
          class="expand-btn"
          title="Tampilkan sidebar"
          @click="isCollapsed = false"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div class="flex-1" />
        <p class="text-xs text-gray-500 hidden md:block">{{ todayLabel }}</p>
        <button class="logout-btn header-logout" title="Log out" @click="authStore.logout()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden md:inline">Log out</span>
        </button>
      </header>

      <main class="content-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const isMobileOpen = ref(false);
const isCollapsed = ref(false);
const { width } = useWindowSize();

const isDesktop = computed(() => width.value >= 1024);

// Swipe left on sidebar to close (mobile only)
let touchStartX = 0;
let touchStartY = 0;

function onTouchStart(e: TouchEvent) {
  if (isDesktop.value || !isMobileOpen.value) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e: TouchEvent) {
  if (isDesktop.value || !isMobileOpen.value) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (dx < -60 && Math.abs(dy) < 50) {
    isMobileOpen.value = false;
  }
}

const todayLabel = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const navItems = computed(() => {
  if (authStore.isAdmin) {
    return [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/students', label: 'Kelola Siswa' },
      { to: '/admin/chapters', label: 'Bab Pelajaran' },
      { to: '/admin/materials', label: 'Materi Pelajaran' },
      { to: '/admin/practice', label: 'Latihan Soal' },
      { to: '/admin/evaluations', label: 'Evaluasi' },
      { to: '/admin/videos', label: 'Video Pembelajaran' },
      { to: '/admin/progress', label: 'Laporan Perkembangan' },
    ];
  }
  return [
    { to: '/siswa', label: 'Dashboard' },
    { to: '/siswa/materials', label: 'Materi Pelajaran' },
    { to: '/siswa/practice', label: 'Latihan Soal' },
    { to: '/siswa/evaluations', label: 'Evaluasi' },
    { to: '/siswa/videos', label: 'Video Pembelajaran' },
    { to: '/siswa/progress', label: 'Progress Belajar' },
  ];
});
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
}

/* ── Sidebar ─────────────────────────────── */
.dashboard-sidebar {
  width: 256px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 40;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebar-brand {
  min-width: 0;
  overflow: hidden;
}

.collapse-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #9ca3af;
  transition: background-color 0.15s, color 0.15s;
}
.collapse-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.close-btn {
  color: #9ca3af;
  font-size: 14px;
  padding: 4px;
}
.close-btn:hover {
  color: #4b5563;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  transition: background-color 0.15s, color 0.15s;
}
.nav-item:hover {
  background: #f3f4f6;
  color: #111827;
}
.nav-item.active {
  background: #2563eb;
  color: #ffffff;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #f3f4f6;
}

.user-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.logout-btn {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #dc2626;
  transition: background-color 0.15s;
}
.logout-btn:hover {
  background: #fef2f2;
}

/* Logout di header (pojok kanan atas) */
.header-logout {
  width: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 7px 14px;
  border: 1px solid #fecaca;
  background: #ffffff;
}
.header-logout:hover {
  background: #fef2f2;
}

/* ── Content ─────────────────────────────── */
.dashboard-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: 256px;
  transition: margin-left 0.3s ease;
}

.content-header {
  position: fixed;
  top: 0;
  left: 256px;
  right: 0;
  z-index: 30;
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: left 0.3s ease;
}

.hamburger {
  padding: 8px;
  border-radius: 8px;
}
.hamburger:hover {
  background: #f3f4f6;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  transition: background-color 0.15s, color 0.15s;
}
.expand-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.content-main {
  flex: 1;
  padding: 24px;
  padding-top: 80px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

/* ── Collapsed (desktop only) ────────────── */
.sidebar-collapsed .dashboard-sidebar {
  transform: translateX(-100%);
}

.sidebar-collapsed .dashboard-content {
  margin-left: 0;
}

.sidebar-collapsed .content-header {
  left: 0;
}

/* ── Mobile: drawer ──────────────────────── */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 40;
}

@media (max-width: 1023px) {
  .dashboard-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.12);
  }
  .sidebar-open .dashboard-sidebar {
    transform: translateX(0);
  }
  .dashboard-content {
    margin-left: 0;
  }
  .content-header {
    left: 0;
  }
  .content-main {
    padding: 16px;
    padding-top: 72px;
  }
}
</style>
