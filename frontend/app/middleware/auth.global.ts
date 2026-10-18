export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  authStore.init();

  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(to.path);

  // Landing page (/): authenticated users go straight to dashboard
  if (to.path === '/' && authStore.isAuthenticated) {
    return navigateTo(authStore.isAdmin ? '/admin' : '/siswa');
  }

  // If not authenticated and trying to access protected page
  if (!authStore.isAuthenticated && !isPublicPage) {
    return navigateTo('/login');
  }

  // If authenticated and trying to access login/register
  if (authStore.isAuthenticated && isPublicPage) {
    if (authStore.isAdmin) {
      return navigateTo('/admin');
    }
    return navigateTo('/siswa');
  }

  // Role-based route protection
  if (authStore.isAuthenticated) {
    if (to.path.startsWith('/admin') && !authStore.isAdmin) {
      return navigateTo('/siswa');
    }
    if (to.path.startsWith('/siswa') && !authStore.isSiswa) {
      return navigateTo('/admin');
    }
  }
});
