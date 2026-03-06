# eBay products Manual QA Testing

---

## SECTION 01: NH2192eeded Questions and Clarifications

Before creating the test cases, followings should be communicated with the relevant teams and get the answers from them.

### Clarifications about the functions

1. What's the definition for the "Same price range"? i.e. Is it less than ±5%, at ±5%, at ±10%, at ±20%, at ±50% of the product shown?
2. What's the criteria to qualify for the "related products"? Is it Most sales? Highest rated? or Most relevant?
3. What proves the seller is a "best seller". I there something from the eBay API we can extract this from? Or is there something like a badge there?
4. Should this be from the same seller or different sellers? -Though this probably from different sellers due to how the selling nature of the sellers
5. Should related products contains out-of-stock products as well? -I've seen some sites has out-of-stock as well. But some don't due to they use it to show what's the next options for the seller
6. What if there's less than 6 products available for the item? Should we discard it for them (hide) or still show them regardless? -Possibly if there's none we won't show them I believe. Or there's a different idea for that
7. What should happen if there's no products available for the related section? Should the section completely needed to be not rendered?
8. Should the relevant products should've changed dynamically when the user selects different variants from the main product? -Probably not I guess since it will give more strain to the servers when the user engagement becomes high, though it seems nice to do dynamically, making relevant for some products such as different toy types/ jewelries etc.
9. Is the user required to be logged-in, in order to see the related products? -we can reduce the server load from this. But then again user experience may needs to be sacrificed
10. Should the sponsored (paid users for ads) be prioritized over others in here?

### Clarifications on UI/UX

11. Where should the section should be always?
12. Where does the "See all" sections send user to?
13. Are the 6 products should be shown in a carousel or in a fixed element (Grid layout)?
14. What does the buttons should be there? i.e. Wishlist, Name, sub category (As the main category is same according to the details), Seller rating, product rating, price, shipping country etc.
15. Should the sponsored ones (Paid users for the ads) have a label or badge for it?

### Clarifications on Technical aspects

16. Do all the browsers supports this related feature? What about the devices (Web view for devices, mobile view, tablet view)
17. Should this sections lazy load or on-demand load with the whole page. (Coz in lazy load scenarios we should do waiting for the elements on testing)
18. Is caching available for the related products section? If so how's the TTL?
19. What's the acceptable page reload time for the related products section?
20. Is there any API endpoints directly available for the testing purposes for the related products section?
21. How does the features mentioned works with poor network conditions?

### Clarifications for the Data and Scope

22. Does mentioned "same category" means uses the same exact category in eBay (Wallets - Men)? Or a broader range of available section? (eg. Fashion and accessories)
23. Are the sponsored products should be excluded or doesn't matter?
24. Are products with unavailable shipping addresses included in related products

---

## SECTION 02: Documentation for the Test Strategy

### 2.1 Objective

Make sure that the Related products section (Section for the best sellers) on the Ebay products page displays correctly as planned. Showing no more than 6 products, match the category correctly (as defined from above) and price range of the main product. Also showing the attention for the UX not only UI. Lastly the functionality as a vital point.

### 2.2 Scope

### In Scope

- Position of the related products in the PDP (Product detail page). And also how th visibility of the element works.
- A validator for the maximum amount of the products that should be added (maximum 6 in this case).
- Validation with the price range with the products shown in related section and with the main product.
- Relevance of the category used to show in this section.
- UI elements. i.e. images, titles, prices, wishlist button, "See All" section.
- Navigation: i.e. clicking on the product, "See All" link, back navigation
- Responsive behavior across different devices. (i.e. Desktop, Mobile, Tablet (if available))
- Edge cases: i.e. No related products available, less than 6 products are available, section is hidden
- Cross browser testing (compatibility): i.e. Accessability across different web browsers (Chrome, Safari, Firefox, etc.).

### Out of scope

- Process of the payment and checkout flow
- Security testing (SQL injection, XSS, input invalidation)
- Account management of the seller's account
- Recommendation algorithm of the eBay
- Performance testing for the backend API (this is a separate concern)
- Auditing done for the accessibility (a dedicated separate pass)

### 2.3 Levels of the testing

Details are demonstrated in a table view as follows. The proposed testing strategy here follows a risk-based layered approach. Starting off with the smoke test, where validates the critical user flow. This way we can ensure the core functionality is working as expected before diving into deeper testing ways. This makes the process more efficient. Then this will be expanded into functional, non-functional and compatibility testing.

| Level                     | Approach                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Smoke                     | Verifying the core (main) search part works -> PDP -> related products section loads                                     |
| Functional                | Verify all acceptance criteria has been met (product count, category, price range, UI elements)                          |
| UI/ Visual                | Verify layout is the same as designated, images, labels etc. across the elements has been loaded                         |
| Negative                  | Empty states. Boundary conditions (0 items, less than 6 items), unavailable related products                             |
| Regression                | When PDP related functionalities or code changes, run a full suite                                                       |
| Cross-browser             | Chrome, Firefox, Safari                                                                                                  |
| Performance (Exploratory) | Check related products load times under throttled network. (This way can test the behavior under poor signal conditions) |

## 2.4 Testing Environment

- **URL:** https://www.ebay.com/
- **Browsers:** Chrome 120+, Firefox 120+, Safari 17+
- **Devices:** Desktop (1280x720), Tablet (768x1024), Mobile (390x844)
- **Network:** Standard broadband + Throttled (3G simulation)
- **User State:** User has been logged out. User has been logged in

### 2.5 Entry Criteria

- Feature has been deployed to the UAT/Staging environment.
- Product Detail Page (PDP) can be accessed without user logging in.
- API/ recommendation service for the related products is running.
- Test data (Products related with the other related items. i.e. In this case other wallets)

### 2.6 Exit Criteria

- All P1/P2 test cases should pass with a high rate of 100% pass rate.
- Opened bugs should not contain any High severity or Critical bugs.
- Regression suites should pass on both Chrome and Firefox.
- Test summary report should be signed off by the QA Lead.

### 2.7 Risk Assessment

| Risk                                                                            | Likelihood | Impact | Steps for the Mitigation                                                                                                                                                                             |
| ------------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-bot automated testing from the eBay might interfere the tests              | High       | Medium | Use agents that are realistic. Using delays. Running tests responsibly                                                                                                                               |
| Related products for the used Main product does not contain specific test items | Medium     | Medium | Use multiple Products as the main product (in this case other wallets from maybe other sellers)                                                                                                      |
| Price range definition has not been confirmed yet                               | High       | High   | As the default assumption for this test, use ±50% as the assumption. Flag PO for the confirmation                                                                                                    |
| Related products section is hidden behind scroll/lazy-load                      | Medium     | Low    | Implement a scroll helper when doing the test cases (Main way). Utilizing delays if needed. But need to be strong enough not to break in different test cases. Might want to take as the last resort |

## SECTION 03: Full Test Suit

### 3.1 Assumptions

- A1: Same Price Range - products in the related products section should be within ±50% price range of the main product
- A2: Same Category - The products resides in the same eBay category/Sub category (i.e. Men's wallet section here) as the main product
- A3: Amount of products showing in the section has a maximum threshold value of 6.
- A4: If the amount of products in the Related products section is less than 6, section shows the available products (with a minimum value of 1)
- A5: If no similar items are available, the section won't be rendered at all.
- A6: User does not need to logged in to the service (eBay in this scenario) in order to view the related products
- A7: Each products card has image, title, price and watch-list button
- A8: There's a "See All" link present which navigates into a broader section of products.
- A9: "See All" section is available when user scrolls to the section (lazy loading)
- A10: Clicking a product in PDP navigates straightly into that product's PDP
- A12: Feature is tested only in English locale only.

### 3.2 Preconditions (Relevant for all the test cases)

- Testing environment is stable and accessible.
- User is on a supported web browser (Chrome, Firefox, Safari)
- User is not login to an eBay user account. (Unless specified to be)
- Stable internet connection is available.
- eBay homepage loads without any issues. No site errors.

### 3.3 Test Data

| DataSet              | Value                             | Purpose                         |
| -------------------- | --------------------------------- | ------------------------------- |
| Primary search term  | `Leather wallet`                  | Standard search for wallet      |
| Specific search term | `Men leather foldable wallet`     | Targeted product search         |
| No results term      | `yyyyynoresultsproductgggggty123` | Negative: validate empty states |

---

### 3.4 Detailed Test cases

#### TC-001 | Smoke | eBay homepage loads

- **Preconditions:** Browser opens. No prior session has been initialized.
- **Steps:** 1. Navigate to https://www.ebay.com/
- **Expected:** Page title says "Electronics, Cars, Fashion, Collectibles & More | eBay". Search bar is visible and not disabled.
- **Priority** P0

#### TC-002 | Smoke | Search results return to "Leather wallet"

- **Preconditions:** on eBay homepage (https://www.ebay.com/)
- **Steps:** 1. Type "Leather wallet" in the search bar. -> 2. Press the search button
- **Expected:** Search results page loads. At minimum of 1 product is available
- **Priority** P0

#### TC-003 | Smoke | Products detailed page loads. Search results are available

- **Preconditions:** Search results for the "Leather wallet" is available.
- **Steps:** 1. Click the first search result
- **Expected:** Navigates into the PDP of the clicked product. URL changes to /itm/...
- **Priority** P0

#### TC-004 | Functional | Related product section is visible in PDP

- **Preconditions:** on a product detail page for "Leather wallet"
- **Steps:** 1. Scrolls down till Related Products section is visible/available
- **Expected:** Section labeled as "Similar items" or similar is available under the product images.
- **Priority** P1

#### TC-005 | Functional | Related product section has the correct title

- **Preconditions:** Related products section has the relevant correct Title
- **Steps:** 1. Check the heading for the section
- **Expected:** Something like "Similar sponsored items", "Similar items" or "Similar items Sponsored" or an equivalent is available.
- **Priority** P1

#### TC-006 | Functional | Maximum amount of 6 products are available

- **Preconditions:** Related products section is available/visible.
- **Steps:** 1. Count all the product cards in related products section
- **Expected:** maximum of 6 products are available in the Related products section.
- **Priority** P1

#### TC-007 | Functional | All products in Related products have the images.

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Inspect each card for image availability.
- **Expected:** Every Product card has it own, non-broken image.
- **Priority** P1

#### TC-008 | Functional | All products in Related products shows their prices

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Inspect each product and confirm their price is visible.
- **Expected:** Every Product card has their price tags
- **Priority** P1

#### TC-009 | Functional | All products in Related products shows display a title

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Look every product and confirm their title's visibility'.
- **Expected:** Every Product card has their own title for their product.
- **Priority** P1

#### TC-010| Functional | "See All" link is visible

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Look for "See All" link in the header.
- **Expected:** "See All" is visible. As well as clickable
- **Priority** P1

#### TC-011 | Functional | Watch-list button is available for each product in Related Products

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Inspect each product and confirm they have a watch-list button.
- **Expected:** Every Product card has a watch-list button.
- **Priority** P1

#### TC-012 | Functional | Related products are in the same category

- **Preconditions:** Related products section is visible. Main product chosen in wallet
- **Steps:** 1. Mark down the category of the main product. -> 2. Click on each product in related products.-> 3. Check their category
- **Expected:** Every Product in related products is in the same category as the main product.
- **Priority** P1

#### TC-013 | Functional | Related products are within the price range of ±50% of the selected Main product

- **Preconditions:** Related products section is visible. Main product is known. It's price tag is visible.
- **Steps:** 1. Record main product's price. -> 2. Record price of each product in the Related products. -> 3. Calculate the percentage difference
- **Expected:** Every Product in Related product has a ±50% difference with the Main product
- **Priority** P1

#### TC-014 | Functional | Clicking a product on the Related products opens it's own PDP

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Click on the 1st product.
- **Expected:** By clicking, it navigates into the product's own PDP. URL will change accordingly with it's unique id
- **Priority** P1

#### TC-015 | Functional | "See All" section navigates to a broader section of products

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Click on the "See All" button.
- **Expected:** By clicking, navigates the user into more related products.
- **Priority** P2

> Removing the following test case as I originally thought clicking the product would open in same window. But it actually opens in a new tab. So this is not something valuable to test. Coz closing newly opened tab and the data on previous tab is still there is just basic browser behavior. Not something related to the business logic

<s>#### TC-016 | Functional | Back Navigation returns back to the Main product's PDP

- **Preconditions:** User has clicked a product in related products section.
- **Steps:** 1. Click browser's back button.
- **Expected:** By clicking, returns to the original PDP. Page state is preserved
- **Priority** P2</s>

#### TC-016 | Functional | Related products section is not available/ not shown when there's no items available to meet the criteria

- **Preconditions:** On a product page that has no related products.
- **Steps:** 1. Navigate into a niche product with no related items.
- **Expected:** Related products section is not visible. Not rendered. No empty placeholder is available
- **Priority** P2

#### TC-017 | UI | Products images in the Related products is not broken. No alts/missing icon showing

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Open PDP -> 2. Scroll to related Products -> 3. Inspect images
- **Expected:** No broken image icons. No Alt text has been displayed.
- **Priority** P1

#### TC-018 | UI | Related products section does not overlap with others page elements.

- **Preconditions:** Related products section is visible.
- **Steps:** 1. Open PDP -> 2. Scroll to related products.
- **Expected:** Related products section is properly contained. No z index issues or layout overflows are present.
- **Priority** P2

#### TC-019 | UI | Related products rendered correctly on the Mobile screen (Emulation for iPhone 12)

- **Preconditions:** Browser set to iPhone 12 viewport
- **Steps:** 1. Search for wallet -> 2. Open 1st product to see it's PDP 3. Count Related products
- **Expected:** No more than 6 is shown in the related products. Related products is visible.
- **Priority** P2

#### TC-020 | UI | Related products rendered correctly on the Tablet screen (Emulation for iPad Pro 11)

- **Preconditions:** Browser set to iPad Pro 11 viewport
- **Steps:** 1. Search for wallet -> 2. Open 1st product to see it's PDP 3. Count Related products
- **Expected:** No more than 6 is shown in the related products. Related products is visible.
- **Priority** P2

## SECTION 04: Bug Reports

---

### BUG-001 | HIGH | Related products shows 7 instead of 6

**Summary:** Related products in the sections has 7 products for the wallet instead of 6 products cards defined as the maximum

**Environment:** Chrome 120 / Desktop / Windows 11 / https://www.ebay.com/

**Preconditions:** Search for "Leather wallet". CLick the first result. Scroll to the related products section

**Steps to reproduce:**

1. Navigate to https://www.ebay.com/
2. Search for "Leather wallet"
3. Click on th first product from the results.
4. Scroll to the "Similar items" section.
5. Count the number of products displayed in the section

**Expected results:** A maximum of 6 products in the section

**Actual results:** 7 products cards are present in the section

**Severity:** High

**Priority:** P1

**Attachments:** screenshot_bug001.png

### BUG-002 | MEDIUM | Product title text overflows outside the card layout in the related products section

**Summary:** Related products cards which have long data in it overflows the card's boundary. Thus breaking the layout and overlapping other elements

**Environment:** Chrome 120 / Desktop / Windows 11 / https://www.ebay.com/

**Preconditions:** Search for "Leather wallet". CLick the first result. Scroll to the related products section where at least one of them has a long product title

**Steps to reproduce:**

1. Navigate to https://www.ebay.com/
2. Search for "Leather wallet"
3. Click on th first product from the results.
4. Scroll to the "Similar items" section.
5. See that a card has lengthy product title in it

**Expected results:** Product data are truncated. Wrapped neatly within the card's boundaries. Has no overflow

**Actual results:** Product titles that has a long name is overflowed outside the container. Overlapping the other page elements as well

**Severity:** Medium

**Priority:** P2

**Attachments:** screenshot_bug002.png

### BUG-003 | MEDIUM | Related product price is 3x higher than the main product price

**Summary:** One of the related product shows a price that has over 300% increment compared to the base product in the PDP. Which is far outside the range designated

**Environment:** Chrome 120 / Desktop / Windows 11 / https://www.ebay.com/

**Preconditions:** Navigated on the PDP having an item priced at 40 USDs.

**Steps to reproduce:**

1. Navigate to https://www.ebay.com/
2. Search for "Leather wallet"
3. Click on th first product from the results.
4. Scroll to the "Similar items" section.
5. Check the prices in the cards

**Expected result:s** All related product are withing the ±50% of the main product

**Actual results:** 4th card has a value of 1280 USD. Which is higher than 320% of the main product

**Priority:** Medium

**Severity:** P2

**Attachments:** screenshot_bug003.png

### BUG-004 | MEDIUM | Broken images displayed in items in related products section

**Summary:** The 3rd card for the similar items has it's image broken

**Environment:** Chrome 120 / Desktop / Windows 11 / https://www.ebay.com/

**Preconditions:** User is on a wallet product page and related products section is visible

**Steps to reproduce:** 
1. Navigate to https://www.ebay.com/
2. Search for "Leather wallet"
3. Click on th first product from the results.
4. Scroll to the "Similar items" section.
5. Check the images in each card

**Expected results:** All Products card displays an image

**Actual results:** 3rd card has no product card and shows as missing

**Priority** Medium

**Severity:** P2

**Attachments:** screenshot_bug004.png

### BUG-005 | LOW | "See all" link in related products section is not keyboard accessible  

**Summary:** "See all" section in the related product cannot be triggered or clicked via the keyboard actions (Tab or Enter). This makes it fails the basic accessibilty requirements

**Environment:** Firefox 110 / Desktop / Linux / https://www.ebay.com/

**Preconditions:** User has navigated to the PDP using keyboard only (No mouse has been used)

**Steps to reproduce:**
1. Navigate to https://www.ebay.com/
2. Search for "Leather wallet"
3. Click on th first product from the results.
4. Use the Tab key to navigate through page elements.
5. Attempt to reach "See All" link in the related products section

**Expected results:** Can focus through by cycling through Tb key to the "See All" section in related products section. Focus indicator is visible

**Actual results:** "See All" is skipped whe trying to cycle through Tab key

**Priority:** Low

**Severity:** P3

**Attachments:** screenshot_bug005.png
