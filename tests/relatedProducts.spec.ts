import test, { expect, Page } from "@playwright/test";
import { SearchPage } from "../pages/SearchPage";
import {
  EbayUrls,
  priceRange,
  RelatedProducts,
  SearchTerms,
} from "../test-data/testData";
import { ProductPage } from "../pages/ProductPage";
import { isWithinPriceRange, smoothScrollToBottom } from "../utils/helpers";

test.describe("eBay related products feature", () => {
  // Smoke tests
  test.describe("Smoke Tests", () => {});
  test("@Smoke TC-001 eBay homepage loads", async ({ page }) => {
    const searchPage = new SearchPage(page);
    searchPage.navigate();

    await expect(page).toHaveTitle(/eBay/i);
    await expect(searchPage.searchInput).toBeVisible();
  });

  test("@Smoke TC-002 - Search results return to 'Leather wallet'", async ({
    page,
  }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();
    await searchPage.searchForProduct(SearchTerms.valid.wallet);

    //count to cross check if data are available for the search
    const count = await searchPage.getSearchResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  test("@Smoke TC-003 - Products detailed page loads. Search results are available", async ({
    page,
  }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();
    await searchPage.searchForProduct(SearchTerms.valid.wallet);

    const count = await searchPage.getSearchResultsCount();
    expect(count).toBeGreaterThan(0);
    const newPage = await searchPage.clickFirstResult();

    await expect(newPage).toHaveURL(/ebay\.com\/itm\//);
  });

  test.describe("Related Products Display", () => {
    //This beforeEach section is to make life easier. Since products get opens in new tab, this is a life save
    let productPage: ProductPage;
    let newPage: Page;

    test.beforeEach(async ({ page }) => {
      const searchPage = new SearchPage(page);
      await searchPage.navigate();
      await searchPage.searchForProduct(SearchTerms.valid.wallet);
      newPage = await searchPage.clickFirstResult();
      productPage = new ProductPage(newPage); //This mmakes the new page as the new testing area. Helps a lot
    });

    test("@Regression TC-004 - Related product section is visible in PDP", async () => {
      // await ProductPage.scroll
      await productPage.scrollToRelatedProducts();
      const isVisible = await productPage.isRelatedProductsSectionVisible();
      expect(isVisible).toBeTruthy();
    });

    test("@Regression TC-005 - Related product section has the correct title", async () => {
      await expect(productPage.relatedProductsHeading).toBeVisible();
      const headlineText =
        await productPage.relatedProductsHeading.textContent();
      expect(headlineText).toMatch(
        /similar items|similar sponsored items|related items/i,
      );
    });

    test("@Regression TC-006 - Maximum amount of 6 products are available", async () => {
      const count = await productPage.getRelatedProductsCount();
      expect(count).toBeGreaterThanOrEqual(RelatedProducts.minCount);
      expect(count).toBeLessThanOrEqual(RelatedProducts.maxCount);
    });

    test("@Regression TC-007 - All products in Related products have the images", async () => {
      const isImagesLoaded = await productPage.areRelatedProductsImagesLoaded();
      expect(isImagesLoaded).toBeTruthy();
    });

    test("@Regression TC-008 - All products in Related products shows their prices", async () => {
      const count = await productPage.relatedProductsPrices.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const priceTxt = await productPage.relatedProductsPrices
          .nth(i)
          .textContent();
        expect(priceTxt).toMatch(/\$[\d,]+\.?\d*/);
      }
    });

    test("@Regression TC-009 - All products in Related products shows display a title", async () => {
      const titles = await productPage.getRelatedProductsTitles();
      expect(titles).toBeGreaterThan(0);
      titles.forEach((title) => {
        expect(title.length).toBeGreaterThan(0);
      });
    });

    test("@Regression TC-010 - 'See All' link is visible", async () => {
      const seeAllVisible = await productPage.isSeeAllLinkVisible();
      expect(seeAllVisible).toBeTruthy();
    });

    test("@Regression TC-011 - Watch-list button is available for each product in Related Products", async () => {
      const watchlistButtonsVisible =
        await productPage.isWatchlistButtonsVisible();
      expect(watchlistButtonsVisible).toBeTruthy();
    });

    test("@Regression TC-012 - Related products are in the same category", async () => {
      // TODO:Do Later!!
    });

    test("@Regression TC-013 - Related products are within the price range of ±50% of the selected Main product", async () => {
      const mainPriceText = await productPage.getMainProductPrice();
      const mainPrice = productPage.parsePriceToNumber(mainPriceText);

      if (mainPrice === 0) {
        test.skip(
          true,
          "Skipping... Reason: Was not able to extract price. Further comparing will be skipped",
        );
        return;
      }

      const relatedPrices = await productPage.getRelatedProductsPrice();
      expect(relatedPrices).toBeGreaterThan(0);

      relatedPrices.forEach((relatedPrice, index) => {
        if (relatedPrice > 0) {
          const withinRange = isWithinPriceRange(
            mainPrice,
            relatedPrice,
            priceRange.tolerancePercent,
          );
          expect(
            withinRange,
            `Related Product #${index + 1} price${relatedPrice} is outside ±${priceRange.tolerancePercent}% of the main Product's price ${mainPrice}`,
          ).toBeTruthy();
        }
      });
    });

    test("@Regression TC-014 - Clicking a product on the Related products opens it's own PDP", async () => {
      const [relatedProductPage] = await Promise.all([
        newPage.context().waitForEvent("page"), // waiting for the new tab from this
        productPage.relatedProductsItems.first().click(),
      ]);
      await relatedProductPage.waitForLoadState("domcontentloaded");
      await expect(relatedProductPage).toHaveURL(/ebay\.com\/itm\//);
    });

    test("@Regression TC-015 - 'See All' section navigates to a broader section of products", async () => {
      const seeAllVisible = await productPage.isSeeAllLinkVisible();
      if (!seeAllVisible) {
        test.skip(
          true,
          '"See All" link is not found. Navigation is cancelled (Skipped)',
        );
        return;
      }
      await productPage.clickSeeAll();
      await expect(newPage).not.toHaveURL(/ebay\.com\/itm\//);
    });

    test("@Regression TC-016 - Related products section is not available/ not shown when there's no items available to meet the criteria", async ({
      page,
    }) => {
      // Notice: I do a got here as only to showcase url skills.
      // As this is within the beforeEach condition here, we can just use the normal search bar thing and click search button of the webpage too.
      const pageErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));
      await page.goto(EbayUrls.searchBase + SearchTerms.edge.noItems);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);

      await expect(page.locator("body")).toBeVisible();
      expect(pageErrors.length).toBe(0);
    });

    test("@Regression TC-017 - Related products rendered correctly on the Mobile screen (390 x 844)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await smoothScrollToBottom(page);

      const isVisible = await productPage.isRelatedProductsSectionVisible();
      expect(isVisible).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
    });

    test("@Regression TC-018 - Related products rendered correctly on the Tablet screen (768 x 1024", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await smoothScrollToBottom(page);

      const isVisible = await productPage.isRelatedProductsSectionVisible();
      expect(isVisible).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
    });

    test("@Regression TC-019 -Products images in the Related products is not broken. No alts/missing icon showing", async () => {});

    test("@Regression TC-020 - Related products section does not overlap with others page elements.", async () => {});
  });
});
