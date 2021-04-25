export { default as canUse } from './canUse';

export const guid = () => {
  function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export const toggleClass = (className, flag, el = document.body) => {
  el.classList[flag ? 'add' : 'remove'](className);
}

export const isIOS = () => !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

export const isAndroid = () => navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1;
