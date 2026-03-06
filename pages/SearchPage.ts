import { expect, Locator, Page } from "@playwright/test";

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchInputMobile: Locator;
  readonly searchButton: Locator;
  readonly searchButtonMobile: Locator;
  readonly searchResults: Locator;
  readonly firstSearchResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator("#gh-ac");
    this.searchInputMobile = page.locator("#kw");
    this.searchButton = page.locator("#gh-search-btn");
    this.searchButtonMobile = page.locator(".gh-search__submitbtn");
    this.searchResults = page.locator(".s-card.s-card");
    this.firstSearchResult = this.searchResults.first();
  }

  async navigate() {
    await this.page.goto("/");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async searchForProduct(productName: string) {
    await this.searchInput.waitFor({ state: "visible" });
    await this.searchInput.fill(productName);
    await this.searchButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
  async searchForProductMobile(productName: string) {
    await this.searchInputMobile.waitFor({ state: "visible" });
    await this.searchInputMobile.fill(productName);
    await this.searchButtonMobile.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async getSearchResultsCount() {
    await this.searchResults
      .first()
      .waitFor({ state: "visible", timeout: 15000 });
    return await this.searchResults.count();
  }

  async clickFirstResult() {
    // await this.searchResults.highlight();
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.searchResults.locator(".s-card__title").nth(2).click(),
    ]);
    await newPage.waitForLoadState("domcontentloaded");
    return newPage;
  }
  async clickFirstResultMobile() {
    await this.searchResults.locator(".s-card__title").nth(2).click();
    await this.page.waitForLoadState("domcontentloaded");
    return this.page;
  }
}
