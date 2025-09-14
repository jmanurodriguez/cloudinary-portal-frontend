/**
 * Configuración y utilidades de Clerk
 */

export const CLERK_CONFIG = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  adminEmails: import.meta.env.VITE_ADMIN_EMAILS || 'cuenta.manuxs@gmail.com,manuxs.rodriguez@gmail.com',
};

/**
 * Verifica si el usuario es administrador
 */
export const isUserAdmin = (userEmail?: string | null): boolean => {
  if (!userEmail) return false;

  const adminEmailList = CLERK_CONFIG.adminEmails
    .split(',')
    .map((email: string) => email.trim());

  return adminEmailList.includes(userEmail);
};

/**
 * Configuración de apariencia para Clerk
 */
export const clerkAppearance = {
  layout: {
    socialButtonsVariant: 'iconButton' as const,
    socialButtonsPlacement: 'bottom' as const,
  },
  variables: {
    colorPrimary: '#3b82f6',
    colorBackground: '#ffffff',
    colorText: '#374151',
    colorTextSecondary: '#6b7280',
    borderRadius: '0.75rem',
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: '#3b82f6',
      '&:hover': {
        backgroundColor: '#2563eb',
      },
    },
    card: {
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  },
};