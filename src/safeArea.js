let insets = null;

export function getSafeArea() {
  if (insets) return insets;

  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;top:0;left:0;width:1px;height:1px;visibility:hidden;pointer-events:none;' +
    'padding-top:env(safe-area-inset-top);padding-right:env(safe-area-inset-right);' +
    'padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);';
  document.body.appendChild(el);

  const cs = getComputedStyle(el);
  insets = {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  };
  el.remove();
  return insets;
}
