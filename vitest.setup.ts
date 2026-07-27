import '@testing-library/jest-dom/vitest';

// jsdom implements none of the Pointer Capture API, and Radix's Select closes
// over it on every pointer event — without these stubs any test that opens a
// <Select> dies with "target.hasPointerCapture is not a function".
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}
