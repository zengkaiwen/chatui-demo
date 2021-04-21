const testCache = {
  passiveListener: () => {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get() {
          supportsPassive = true;
        },
      });
      window.addEventListener('test', null, opts);
    } catch (e) {
    }
    return supportsPassive;
  },
  smoothScroll: () => 'scrollBehavior' in document.documentElement.style,
  touch: () => 'ontouchstart' in window,
};

export function addTest(name, test) {
  testCache[name] = test();
}

export default function canUse(name) {
  return testCache[name]();
}