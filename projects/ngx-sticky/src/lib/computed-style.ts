/**
 * Computed style lookup ported from @ngui/utils (W3C path).
 * Camel-case property names are converted to CSS notation before reading.
 */
export function computedStyle(element: HTMLElement | string, styleProp: string): string {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) {
    return '';
  }

  const defaultView = (el.ownerDocument ?? document).defaultView;
  if (!defaultView?.getComputedStyle) {
    return '';
  }

  const property = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
  return defaultView.getComputedStyle(el, null).getPropertyValue(property);
}
