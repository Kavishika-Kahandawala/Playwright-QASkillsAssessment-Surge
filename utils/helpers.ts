import { Page } from "@playwright/test";

export async function smoothScrollToBottom(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalScrolled = 0;
      const distance = 300;
      const delay = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalScrolled += distance;
        if (totalScrolled >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve;
        }
      }, delay);
    });
  });
}

export function isWithinPriceRange(
  mainPrice: number,
  relatedPrice: number,
  tolerancePercent: number,
): boolean {
  if (mainPrice === 0) return true; // if main Product Price is not detected we skip :)
  const lower = mainPrice * (1 - tolerancePercent / 100);
  const upper = mainPrice * (1 + tolerancePercent / 100);
  return relatedPrice >= lower && relatedPrice <= upper;
}
