import "@testing-library/jest-dom/vitest";

// antd 在 jsdom 需要的瀏覽器 API（Grid 斷點、Table 捲動量測、QRCode canvas）
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
if (!("ResizeObserver" in window)) {
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (window as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;
}
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"];
window.getComputedStyle = ((orig) => (el: Element, pseudo?: string | null) => orig(el, pseudo ?? undefined))(
  window.getComputedStyle.bind(window),
);
