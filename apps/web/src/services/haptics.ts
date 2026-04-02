export function vibrateSuccess(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

export function vibrateError(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([10, 50, 10]);
  }
}
