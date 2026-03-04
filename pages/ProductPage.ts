import { Locator, Page } from "@playwright/test";

export class ProductPage {
  readonly page: Page;
  readonly productCategory: Locator;
  readonly productPrice: Locator;

  readonly relatedProductsSection: Locator;
  readonly relatedProductsHeading: Locator;
  readonly relatedProductsItems: Locator;
  readonly relatedProductsTitles: Locator;
  readonly relatedProductsPrices: Locator;
  readonly relatedProductsImages: Locator;
  readonly seeAllLink: Locator;
  readonly watchlistButton: Locator;
  readonly categoryTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCategory = page.locator("").first();
    // this.relatedProductsSection = page.locator("h2.busU").first();
    this.relatedProductsHeading = page
      .locator(
        'h2:has-text("Similar items"), h2:has-text("Similar sponsored items"), h2:has-text("Related items")',
      )
      .first();

    this.relatedProductsSection = page
      .locator(
        'div:has(h2:has-text("Similar items")), div:has(h2:has-text("Similar sponsored items"))',
      )
      .first();

    this.relatedProductsItems = page.locator(
      'div:has(h2:has-text("Similar items")) section,' +
        ' div:has(h2:has-text("Similar sponsored items")) section',
    );

    this.relatedProductsTitles = page.locator(
      'div:has(h2:has-text("Similar items")) h3,' +
        ' div:has(h2:has-text("Similar sponsored items")) h3',
    );

    this.relatedProductsPrices = page
      .locator('div:has(h2:has-text("Similar items")) span[role="text"],')
      .filter({ hasText: /\$[d,]+/ });

    this.relatedProductsImages = page.locator(
      'div:has(h2:has-text("Similar items")) img[src*=ebayimg.com],' +
        ' div:has(h2:has-text("Similar sponsored items")) img[src*=ebayimg.com]',
    );

    this.seeAllLink = page
      .locator("a.recs-see-all-link-align-with-subtitle")
      .first();

    this.watchlistButton = page.locator(
      'button[aria-label*="to your watch list"]',
    );

    this.categoryTitle = page.locator("");
    this.productPrice = page.locator("");
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }

  async scrollToRelatedProducts() {
    // await this.page.evaluate(() =>
    //   window.scrollTo(0, document.body.scrollHeight * 0.7),
    // );
    // await this.relatedProductsSection.highlight();
    await this.relatedProductsHeading.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
  }

  async getRelatedProductsCount(): Promise<number> {
    await this.scrollToRelatedProducts();
    await this.relatedProductsHeading
      .first()
      .waitFor({ state: "visible", timeout: 5000 });
    return this.relatedProductsHeading.count();
  }

  async areRelatedProductsImagesLoaded(): Promise<boolean> {
    const count = await this.relatedProductsImages.count();
    if (count === 0) return false;
    for (let i = 0; i < count; i++) {
      const naturalWidth = await this.relatedProductsImages
        .nth(i)
        .evaluate((img: HTMLImageElement) => img.naturalWidth);
      if (naturalWidth === 0) return false;
    }
    return true;
  }

  async getRelatedProductsTitles(): Promise<string[]> {
    const count = await this.relatedProductsTitles.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.relatedProductsTitles.nth(i).textContent();
      titles.push((text || "").trim());
    }
    return titles;
  }

  async isSeeAllLinkVisible(): Promise<boolean> {
    try {
      await this.seeAllLink.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isWatchlistButtonsVisible(): Promise<boolean> {
    await this.watchlistButton.waitFor({ state: "visible", timeout: 5000 });
    const count = await this.watchlistButton.count();
    return count > 0;
  }

  async getMainProductPrice(): Promise<string> {
    await this.productPrice.waitFor({ state: "visible", timeout: 5000 });
    return ((await this.productPrice.textContent()) || "").trim();
  }

  parsePriceToNumber(priceString: string): number {
    const match = priceString.match(/[\d,]+\.?\d*/);
    if (!match) {
      return 0;
    }
    return parseFloat(match[0].replace(",", ""));
  }

  async getRelatedProductsPrice(): Promise<number[]> {
    const count = await this.relatedProductsPrices.count();
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const priceText = await this.relatedProductsPrices.nth(i).textContent();
      prices.push(this.parsePriceToNumber(priceText || "0"));
    }
    return prices;
  }

  async clickSeeAll() {
    await this.seeAllLink.click();
    await this.page.waitForEvent("domcontentloaded");
  }

  async isRelatedProductsSectionVisible(): Promise<boolean> {
    await this.scrollToRelatedProducts();
    try {
      await this.relatedProductsSection.waitFor({
        state: "visible",
        timeout: 6000,
      });
      return true;
    } catch {
      return false;
    }
  }
}
