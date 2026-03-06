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
  // readonly categoryTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCategory = page.locator("a.seo-breadcrumb-text").first();
    // this.relatedProductsSection = page.locator("h2.busU").first();
    this.relatedProductsHeading = page
      .locator(
        'h2:has-text("Similar items"), h2:has-text("Similar sponsored items"), h2:has-text("Related items"), h2:has-text("Compare with similar items"), h2:has-text("Customers also considered")',
      )
      .first();

    this.relatedProductsSection = page
      .locator(
        'div:has(h2:has-text("Similar items")), div:has(h2:has-text("Similar sponsored items")), div:has(h2:has-text("Compare with similar items")), div:has(h2:has-text("Customers also considered"))',
      )
      .first();

    this.relatedProductsItems = page.locator(
      'div:has(h2:has-text("Similar items")) a[aria-label][href*="/itm/"],' +
        'div:has(h2:has-text("Compare with similar items"))  a[aria-label][href*="/itm/"],' +
        'div:has(h2:has-text("Customers also considered")) a[aria-label][href*="/itm/"]',
    );

    this.relatedProductsTitles = page.locator(
      'div:has(h2:has-text("Similar items")) section[data-viewport] h3',
    );

    this.relatedProductsPrices = page
      .locator(
        'div:has(h2:has-text("Similar items")) section[data-viewport] span[role="text"]',
      )
      .filter({ hasText: /^\$/ });

    this.relatedProductsImages = page.locator(
      "div.recs-image-wrap-below-hero img",
    );

    this.seeAllLink = page
      .locator(
        "a.recs-see-all-link-align-with-subtitle, a.recs-see-all-link-mweb-align-with-subtitle",
      )
      .first();

    this.watchlistButton = page.locator(
      'button[aria-label*="to your watch list"]',
    );

    this.productPrice = page
      .locator('[data-testid="x-price-primary"]')
      .first()
      .filter({ hasText: /\d/ });
    // .filter({ hasText: /\$/ });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }

  // async scrollToBottom(){
  //   await this.page.evaluate(() =>window.scrollTo(0, document.body.scrollHeight * 0.1))
  //   await this.page.waitForTimeout(1500)
  // }
  async scrollToBottom() {
    await this.page.evaluate(
      async () =>
        await new Promise<void>((resolve) => {
          let currentPosition = 0;
          const step = document.body.scrollHeight ** 0.75;
          const delay = 150;

          const timer = setInterval(() => {
            currentPosition += step;
            window.scrollTo(0, currentPosition);
            if (currentPosition >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, delay);
        }),
    );
    await this.page.waitForTimeout(1500);
  }
  async scrollByPointOne() {
    await this.page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight * 0.1),
    );
    await this.page.waitForTimeout(1500);
  }
  async scrollByPointThree() {
    await this.page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight * 0.3),
    );
    await this.page.waitForTimeout(1500);
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

  async clickSeeAll(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),

      await this.seeAllLink.click(),
    ]);
    await newPage.waitForEvent("domcontentloaded");
    return newPage;
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

  async getCategory(): Promise<string> {
    const lastBreadcrumb = this.productCategory.last();
    const text = await lastBreadcrumb.textContent();
    return (text || "").trim();
  }

  async clickRelatedProducts(index: number = 0) {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.relatedProductsItems.nth(index).click(),
    ]);
    await newPage.waitForLoadState("domcontentloaded");
    return newPage;
  }
}
