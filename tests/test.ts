import test, { devices, expect, Page } from "@playwright/test";
import { SearchPage } from "../pages/SearchPage";
import {
  EbayUrls,
  priceRange,
  RelatedProducts,
  SearchTerms,
} from "../test-data/testData";
import { ProductPage } from "../pages/ProductPage";
import { isWithinPriceRange } from "../utils/helpers";

test.describe("eBay related products feature", () => {

  // ─────────────────────────────────────────────
  // SMOKE TESTS
  // ─────────────────────────────────────────────
  test.describe("Smoke Tests", () => {

    test("@Smoke TC-001 eBay homepage loads", async ({ page }) => {
      const searchPage = new SearchPage(page);
      await searchPage.navigate();

      await expect(page).toHaveTitle(/eBay/i);
      await expect(searchPage.searchInput).toBeVisible();
    });

    test("@Smoke TC-002 - Search results return for 'Leather wallet'", async ({ page }) => {
      const searchPage = new SearchPage(page);
      await searchPage.navigate();
      await searchPage.searchForProduct(SearchTerms.valid.wallet);

      const count = await searchPage.getSearchResultsCount();
      expect(count).toBeGreaterThan(0);
    });

    test("@Smoke TC-003 - Product detail page loads from search result", async ({ page }) => {
      const searchPage = new SearchPage(page);
      await searchPage.navigate();
      await searchPage.searchForProduct(SearchTerms.valid.wallet);

      const count = await searchPage.getSearchResultsCount();
      expect(count).toBeGreaterThan(0);

      const newPage = await searchPage.clickFirstResult();
      await expect(newPage).toHaveURL(/ebay\.com\/itm\//);
    });

  });

  // ─────────────────────────────────────────────
  // RELATED PRODUCTS DISPLAY
  // ─────────────────────────────────────────────
  test.describe("Related Products Display", () => {
    let productPage: ProductPage;
    let newPage: Page;

    test.beforeEach(async ({ page }) => {
      const searchPage = new SearchPage(page);
      await searchPage.navigate();
      await searchPage.searchForProduct(SearchTerms.valid.wallet);
      newPage = await searchPage.clickFirstResult();
      productPage = new ProductPage(newPage);
      await productPage.scrollToRelatedProducts();
    });

    test("@Regression TC-004 - Related product section is visible in PDP", async () => {
      const isVisible = await productPage.isRelatedProductsSectionVisible();
      expect(isVisible).toBeTruthy();
    });

    test("@Regression TC-005 - Related product section has the correct title", async () => {
      await expect(productPage.relatedProductsHeading).toBeVisible();
      const headlineText = await productPage.relatedProductsHeading.textContent();
      expect(headlineText).toMatch(
        /similar items|similar sponsored items|related items/i,
      );
    });

    test("@Regression TC-006 - Maximum amount of 6 products are displayed", async () => {
      const count = await productPage.getRelatedProductsCount();
      expect(count).toBeGreaterThanOrEqual(RelatedProducts.minCount);
      expect(count).toBeLessThanOrEqual(RelatedProducts.maxCount);
    });

    test("@Regression TC-007 - All related products have images", async () => {
      const isImagesLoaded = await productPage.areRelatedProductsImagesLoaded();
      expect(isImagesLoaded).toBeTruthy();
    });

    test("@Regression TC-008 - All related products show their prices", async () => {
      const count = await productPage.relatedProductsPrices.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const priceTxt = await productPage.relatedProductsPrices.nth(i).textContent();
        expect(priceTxt).toMatch(/\$[\d,]+\.?\d*/);
      }
    });

    test("@Regression TC-009 - All related products display a title", async () => {
      const titles = await productPage.getRelatedProductsTitles();
      expect(titles.length).toBeGreaterThan(0);
      titles.forEach((title) => {
        expect(title.length).toBeGreaterThan(0);
      });
    });

    test("@Regression TC-010 - 'See All' link is visible", async () => {
      const seeAllVisible = await productPage.isSeeAllLinkVisible();
      expect(seeAllVisible).toBeTruthy();
    });

    test("@Regression TC-011 - Watchlist button is available for each related product", async () => {
      const watchlistButtonsVisible = await productPage.isWatchlistButtonsVisible();
      expect(watchlistButtonsVisible).toBeTruthy();
    });

    test("@Regression TC-012 - Related products are in the same category as the main product", async () => {
      const mainCategory = await productPage.getCategory();
      expect(mainCategory.length).toBeGreaterThan(0);

      const count = await productPage.relatedProductsItems.count();
      for (let i = 0; i < count; i++) {
        const relatedPage = await productPage.clickRelatedProducts(i);
        const relatedProductPage = new ProductPage(relatedPage);
        const relatedCategory = await relatedProductPage.getCategory();
        expect(
          relatedCategory,
          `Related Product #${i + 1} category "${relatedCategory}" does not match main category "${mainCategory}"`,
        ).toBe(mainCategory);
        await relatedPage.close();
      }
    });

    test("@Regression TC-013 - Related products are within ±50% price range of the main product", async () => {
      const mainPriceText = await productPage.getMainProductPrice();
      const mainPrice = productPage.parsePriceToNumber(mainPriceText);

      if (mainPrice === 0) {
        test.skip(true, "Could not extract main product price — skipping");
        return;
      }

      const relatedPrices = await productPage.getRelatedProductsPrice();
      expect(relatedPrices.length).toBeGreaterThan(0);

      relatedPrices.forEach((relatedPrice, index) => {
        if (relatedPrice > 0) {
          const withinRange = isWithinPriceRange(
            mainPrice,
            relatedPrice,
            priceRange.tolerancePercent,
          );
          expect(
            withinRange,
            `Related Product #${index + 1} price $${relatedPrice} is outside ±${priceRange.tolerancePercent}% of main price $${mainPrice}`,
          ).toBeTruthy();
        }
      });
    });

    test("@Regression TC-014 - Clicking a related product opens its own PDP", async () => {
      const [relatedProductPage] = await Promise.all([
        newPage.context().waitForEvent("page"),
        productPage.relatedProductsItems.first().click(),
      ]);
      await relatedProductPage.waitForLoadState("domcontentloaded");
      await expect(relatedProductPage).toHaveURL(/ebay\.com\/itm\//);
    });

    test("@Regression TC-015 - 'See All' navigates to a broader results page", async () => {
      const seeAllVisible = await productPage.isSeeAllLinkVisible();
      if (!seeAllVisible) {
        test.skip(true, '"See All" link not found — skipping');
        return;
      }
      const newSeeAllPage = await productPage.clickSeeAll();
      await expect(newSeeAllPage).toHaveURL(/ebay\.com\/recs/);
    });

    test("@Regression TC-016 - Page does not break when no related products are available", async () => {
      // register listener BEFORE navigating so no errors are missed
      const pageErrors = capturePageErrors(newPage);

      await newPage.goto(EbayUrls.searchBase + SearchTerms.edge.noItems);
      await newPage.waitForLoadState("domcontentloaded");
      await newPage.waitForTimeout(2000);

      await expect(newPage.locator("body")).toBeVisible();
      expect(pageErrors.length).toBe(0);
    });

    test("@Regression TC-019 - Related product images are not broken", async () => {
      const images = productPage.relatedProductImages;
      const count = await images.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const image = images.nth(i);

        // check image is visible
        await expect(image).toBeVisible();

        // naturalWidth is 0 if the image is broken
        const naturalWidth = await image.evaluate(
          (img: HTMLImageElement) => img.naturalWidth,
        );
        expect(
          naturalWidth,
          `Image #${i + 1} is broken — naturalWidth is 0`,
        ).toBeGreaterThan(0);

        // confirm src is a real eBay product image
        const src = await image.getAttribute("src");
        expect(src).toBeTruthy();
        expect(src).toContain("ebayimg.com");
      }
    });

    test("@Regression TC-020 - Related products section does not overlap other page elements", async () => {
      const section = productPage.relatedProductsSection;
      await expect(section).toBeVisible();

      // get the section's position and dimensions
      const sectionBox = await section.boundingBox();
      expect(sectionBox).not.toBeNull();

      // section must have real dimensions — 0 height means collapsed/hidden
      expect(sectionBox!.width).toBeGreaterThan(0);
      expect(sectionBox!.height).toBeGreaterThan(0);

      // section must sit within the horizontal viewport — overflow = overlap
      const viewportSize = newPage.viewportSize();
      expect(sectionBox!.x).toBeGreaterThanOrEqual(0);
      expect(sectionBox!.x + sectionBox!.width).toBeLessThanOrEqual(
        viewportSize!.width + 1, // +1 for rounding tolerance
      );
    });

  });

  // ─────────────────────────────────────────────
  // RESPONSIVE BEHAVIOUR
  // Outside Related Products Display so test.use() works correctly
  // Each device needs its own describe + beforeEach
  // ─────────────────────────────────────────────
  test.describe("Responsive Behaviour", () => {

    test.describe("Mobile", () => {
      test.use({ ...devices["iPhone 12"] });

      let productPage: ProductPage;
      let newPage: Page;

      test.beforeEach(async ({ page }) => {
        const searchPage = new SearchPage(page);
        await searchPage.navigate();
        await searchPage.searchForProduct(SearchTerms.valid.wallet);
        newPage = await searchPage.clickFirstResult();
        productPage = new ProductPage(newPage);
        await productPage.scrollToRelatedProducts();
      });

      test("@Regression TC-017 - Related products renders correctly on mobile", async () => {
        const isVisible = await productPage.isRelatedProductsSectionVisible(); // ← await added
        expect(isVisible).toBeTruthy();
        await expect(productPage.relatedProductsItems.first()).toBeVisible();
      });
    });

    test.describe("Tablet", () => {
      test.use({ ...devices["iPad (gen 11) landscape"] });

      let productPage: ProductPage;
      let newPage: Page;

      test.beforeEach(async ({ page }) => {
        const searchPage = new SearchPage(page);
        await searchPage.navigate();
        await searchPage.searchForProduct(SearchTerms.valid.wallet);
        newPage = await searchPage.clickFirstResult();
        productPage = new ProductPage(newPage);
        await productPage.scrollToRelatedProducts();
      });

      test("@Regression TC-018 - Related products renders correctly on tablet", async () => {
        const isVisible = await productPage.isRelatedProductsSectionVisible(); // ← await added
        expect(isVisible).toBeTruthy();
        await expect(productPage.relatedProductsItems.first()).toBeVisible();
      });
    });

  });

});