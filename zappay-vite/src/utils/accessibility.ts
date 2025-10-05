// Accessibility utilities for ZapPay

export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const focusElement = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
  }
};

export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

export const getAriaLabel = (action: string, context?: string) => {
  const labels: Record<string, string> = {
    'send-money': 'Send money',
    'receive-money': 'Receive money',
    'view-balance': 'View account balance',
    'transaction-history': 'View transaction history',
    'profile-settings': 'Open profile settings',
    'security-settings': 'Open security settings',
    'logout': 'Log out of account',
    'close': 'Close dialog',
    'menu': 'Open navigation menu',
    'search': 'Search transactions',
    'filter': 'Filter results',
    'sort': 'Sort results',
    'refresh': 'Refresh data',
    'loading': 'Loading content',
    'error': 'Error occurred',
    'success': 'Operation successful'
  };

  const baseLabel = labels[action] || action;
  return context ? `${baseLabel} ${context}` : baseLabel;
};

export const generateId = (prefix: string) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const isHighContrastMode = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

export const isReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
