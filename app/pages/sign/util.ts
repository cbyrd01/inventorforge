/**
 * Waits until the supplied HTML element is rendered by requesting animation frames and checking the element's width.
 * @param element The HTML element.
 * @returns {Promise<T>} A promise that resolves when the element is rendered.
 */

// See https://github.com/GerritErpenstein/ionic2-slides-temp-fix/
export function waitRendered(element: HTMLElement): Promise<HTMLElement> {
  return new Promise((resolve) => {
    let checkNextFrame = () => {
      requestAnimationFrame(() => {
        if (element.clientWidth) { resolve(element); } else { checkNextFrame(); }
      });
    };
    checkNextFrame();
  });
}
