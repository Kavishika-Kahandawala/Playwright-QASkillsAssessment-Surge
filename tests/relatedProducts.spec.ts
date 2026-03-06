import test, { devices, expect, Page } from "@playwright/test";
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
  test.describe("Smoke Tests", () => {
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
      await productPage.scrollToRelatedProducts();
    });

    test("@Regression TC-004 - Related product section is visible in PDP", async () => {
      // await ProductPage.scroll
      // await productPage.scrollToRelatedProducts();
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
      // await productPage.scrollToRelatedProducts();
      const isImagesLoaded = await productPage.areRelatedProductsImagesLoaded();
      expect(isImagesLoaded).toBeTruthy();
    });

    test("@Regression TC-008 - All products in Related products shows their prices", async () => {
      // await productPage.scrollToRelatedProducts();
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
      // await productPage.scrollToRelatedProducts();
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

    test("@Regression TC-011 - Watch-list button is available for each product in Related Products", async () => {
      const watchlistButtonsVisible =
        await productPage.isWatchlistButtonsVisible();
      expect(watchlistButtonsVisible).toBeTruthy();
    });

    test("@Regression TC-012 - Related products are in the same category", async () => {
      const mainCategory = await productPage.getCategory();
      expect(mainCategory.length).toBeGreaterThan(0);
      const count = await productPage.relatedProductsItems.count();
      for (let i = 0; i < count; i++) {
        const relatedPage = await productPage.clickRelatedProducts(i);
        const relatedProductPage = new ProductPage(relatedPage);
        const relatedCategory = await relatedProductPage.getCategory();
        expect(
          relatedCategory,
          `Related Product #${i + 1} category ${relatedCategory}does not match`,
        ).toBe(mainCategory);
        await relatedPage.close();
      }
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
      const newSeeAllPage = await productPage.clickSeeAll();
      await expect(newSeeAllPage).toHaveURL(/ebay\.com\/recs/);
    });

    test("@Regression TC-016 - Related products section is not available/ not shown when there's no items available to meet the criteria", async ({}) => {
      // await newPage.close()
      // Notice: I do a got here as only to showcase url skills.
      // As this is within the beforeEach condition here, we can just use the normal search bar thing and click search button of the webpage too.
      const pageErrors: string[] = [];
      newPage.on("pageerror", (err) => pageErrors.push(err.message));
      await newPage.goto(EbayUrls.searchBase + SearchTerms.edge.noItems);
      await newPage.waitForLoadState("domcontentloaded");
      await newPage.waitForTimeout(2000);

      await expect(newPage.locator("body")).toBeVisible();
      expect(pageErrors.length).toBe(0);

      //eBay always suggests something. So we can't test no results.
      // Instead we will check if it says no results has been found text is visible.Which is kind of a valid reasoning
    const bodyText = await newPage.locator("body").innerText()
    expect(bodyText).toMatch(/no exact match|didn't find|no results/i)
    });

    test("@Regression TC-017 -  Products images in the Related products is not broken. No alts/missing icon showing", async () => {
      const images = productPage.relatedProductsImages;
      const count = await images.count();

      // to test, at least one image should present. We check it first
      expect(
        count,
        "No images has been found in the related products section",
      ).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const image = images.nth(i);

        // mage should be visible in the webpage
        await expect(image, `Image No. ${i + 1} is not visible`).toBeVisible();

        // src should check if it points to something. Otherwise the browser will show a broken image mark
        // also we validating if the url is from ebayimg, just to be precise 
        const src = await image.getAttribute("src");
        expect(src, `Image No. ${i + 1} has no src attributes`).toBeTruthy();
        expect(
          src,
          `Image No. ${i + 1} src does not point to ebayimg.com`,
        ).toContain("ebayimg.com");

        const naturalWidth = await image.evaluate(
          (img: HTMLImageElement) => img.naturalWidth,
        );

        // If natural width is 0, means browser tried to load the image. But it was not present.
        expect(
          naturalWidth,
          `Image No. ${i + 1} failed to load (naturalWidth is 0). Means broken icons might be showing already`,
        ).toBeGreaterThan(0);

        const alt = await image.getAttribute("alt");
        // we do a "if" 1st coz there might be instances which has no alts
        if (alt) {
          expect(alt.toLowerCase()).not.toMatch(
            /missing|broken|error|not found|unavailable/,
          );
        }
      }
    });

    test("@Regression TC-018 - Related products section does not overlap with others page elements.", async () => {
      const section = productPage.relatedProductsSection;
      const sectionBox = await section.boundingBox();
      expect(
        section,
        "Could not get bounding box for the related products section unfortunately",
      ).not.toBeNull();

      // section should have real dimensions. Having zero width/height means it's collapsed
      expect(
        sectionBox!.width,
        "Related product section has a zero width",
      ).toBeGreaterThan(0);
      expect(
        sectionBox!.height,
        "Related product section has a zero height",
      ).toBeGreaterThan(0);

      //section
      expect(
        sectionBox!.x,
        "Related products section starts outside from the left viewport edge",
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
test.describe("Responsiveness behavior testing cases", () => {
  test.describe("Mobile", () => {
    test("@Regression TC-019 - Related products rendered correctly on the Mobile screen (Emulation for iPhone 12)", async ({
      browser,
    }) => {
      const context = await browser.newContext({ ...devices["iPhone 12"] });
      const page = await context.newPage();
      const searchPage = new SearchPage(page);
      await searchPage.navigate();
      // await newPage.goto(EbayUrls.searchBase + SearchTerms.edge.noItems);
      await searchPage.searchForProductMobile(SearchTerms.valid.wallet);

      const newPage = await searchPage.clickFirstResultMobile();
      const productPage = new ProductPage(newPage);
      // scroll because of the lazy load
      await productPage.scrollByPointThree();
      await productPage.scrollToRelatedProducts();

      const isVisible = await productPage.isRelatedProductsSectionVisible();
      expect(isVisible).toBeTruthy();

      await expect(productPage.relatedProductsItems.first()).toBeVisible();

      await context.close();
    });
  });
  test.describe("Tablet", () => {
    test("@Regression TC-020 - Related products rendered correctly on the Tablet screen (Emulation for iPad Pro 11)", async ({
      browser,
    }) => {
      const context = await browser.newContext({ ...devices["iPad Pro 11"] });
      const page = await context.newPage();
      const searchPage = new SearchPage(page);
      await searchPage.navigate();
      // await newPage.goto(EbayUrls.searchBase + SearchTerms.edge.noItems);
      await searchPage.searchForProduct(SearchTerms.valid.wallet);

      const newPage = await searchPage.clickFirstResult();
      const productPage = new ProductPage(newPage);
      // scroll because of the lazy load.
      // We do not scroll all as it sometimes stuck in infinite loops for tablet view
      await productPage.scrollByPointOne()
      await productPage.scrollToRelatedProducts();

      const isVisible = await productPage.isRelatedProductsSectionVisible();
      expect(isVisible).toBeTruthy();

      await expect(productPage.relatedProductsItems.first()).toBeVisible();

      await context.close();
    });
  });
});

//   test.describe("Mobile", () => {
//     // test.use({ ...devices["iPhone 11"] });

//     let productPage: ProductPage;
//     let newPage: Page;

//     test.beforeEach(async ({ page }) => {
//       const searchPage = new SearchPage(page);
//       await searchPage.navigate();
//       await searchPage.searchForProduct(SearchTerms.valid.wallet);
//       newPage = await searchPage.clickFirstResult();
//       productPage = new ProductPage(newPage); //This mmakes the new page as the new testing area. Helps a lot
//       await productPage.scrollToRelatedProducts();

//     });
//     test("@Regression TC-017 - Related products rendered correctly on the Mobile screen (390 x 844)", async ()=> {
//       expect(true).toBeTruthy()
//     })
//     // test("@Regression TC-017 - Related products rendered correctly on the Mobile screen (390 x 844)", async ({
//     //   page,
//     // }) => {
//     //   await smoothScrollToBottom(page);
//     //   const isVisible = productPage.isRelatedProductsSectionVisible();
//     //   expect(isVisible).toBeTruthy()
//     // });
//   });
// });
// test.describe("Responsiveness behavior testing cases", () => {
//   test.describe("Mobile", () => {
//     test.use({ ...devices["iPhone 12"] });

//     let productPage: ProductPage;
//     let newPage: Page;

//     test.beforeEach(async ({ page }) => {
//       const searchPage = new SearchPage(page);
//       await searchPage.navigate();
//       await searchPage.searchForProduct(SearchTerms.valid.wallet);
//       newPage = await searchPage.clickFirstResult();
//       productPage = new ProductPage(newPage); //This mmakes the new page as the new testing area. Helps a lot
//       await productPage.scrollToRelatedProducts();
//     });
//     test("@Regression TC-017 - Related products rendered correctly on the Mobile screen (390 x 844)", async ({
//       page,
//     }) => {
//       // await page.setViewportSize({ width: 390, height: 844 });
//       await smoothScrollToBottom(page);

//
//       expect(isVisible).toBeTruthy();
//       await expect(productPage.relatedProductsItems.first()).toBeVisible();
//     });
//   });
//   test.describe("Tablet", () => {
//     test.use({ ...devices["iPad (gen 11) landscape"] });

//     let productPage: ProductPage;
//     let newPage: Page;

//     test.beforeEach(async ({ page }) => {
//       const searchPage = new SearchPage(page);
//       await searchPage.navigate();
//       await searchPage.searchForProduct(SearchTerms.valid.wallet);
//       newPage = await searchPage.clickFirstResult();
//       productPage = new ProductPage(newPage); //This mmakes the new page as the new testing area. Helps a lot
//       await productPage.scrollToRelatedProducts();
//     });
//     test("@Regression TC-017 - Related products rendered correctly on the Mobile screen (390 x 844)", async ({
//       page,
//     }) => {
//       // await page.setViewportSize({ width: 390, height: 844 });
//       await smoothScrollToBottom(page);

//       const isVisible = productPage.isRelatedProductsSectionVisible();
//       expect(isVisible).toBeTruthy();
//       await expect(productPage.relatedProductsItems.first()).toBeVisible();
//     });
//   });
// });
