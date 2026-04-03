export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function isSupported(): boolean {
  return 'Notification' in window;
}

export function getPermissionStatus():
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function showNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return;

  // Use service worker registration for PWA notifications
  const reg = await navigator.serviceWorker?.getRegistration();
  if (reg) {
    reg.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'keiro-reminder', // Replace previous notification
    });
  } else {
    new Notification(title, { body });
  }
}
