# eBay products Manual QA Testing

---

## SECTION 01: Needed Questions and Clarifications

Before creating the test cases, followings should be communicated with the relevant teams and get the answers from them.

### Clarifications about the functions

1. What's the definition for the "Same price range"? i.e. Is it less than ±5%, at ±5%, at ±10%, at ±20%, at ±50% of the product shown?
2. What's the criteria to qualify for the "related products"? Is it Most sales? Highest rated? or Most relevant?
3. Is the products for related products are same from eBay? So we can use the same eBay APIs? or from something else?
4. What proves the seller is a "best seller". I there something from the eBay API we can extract this from? Or is there something like a badge there?
5. Should this be from the same seller or different sellers? -Though this probably from different sellers due to how the selling nature of the sellers
6. Should related products contains out-of-stock products as well? -I've seen some sites has out-of-stock as well. But some don't due to they use it to show what's the next options for the seller
7. What if there's less than 6 products available for the item? Should we discard it for them (hide) or still show them regardless? -Possibly if there's none we won't show them I believe. Or there's a different idea for that
8. Should the relevant products should've changed dynamically when the user selects different variants from the main product? -Probably not I guess since it will give more strain to the servers when the user engagement becomes high, though it seems nice to do dynamically, making relevant for some products such as different toy types/ jewelries etc.
9. Is the user required to be logged-in, in order to see the related products? -we can reduce the server load from this. But then again user experience may needs to be sacrificed
10. Are we gonna use AI or anything to decide the related products? i.e. By checking user's patterns of products searching, we can suggest products. -I've seen some e-commerce websites do this where they gonna suggest you based on your behavior. Like giving cheaper solutions etc.
11. Should the sponsored (paid users for ads) be prioritized over others in here?

### Clarifications on UI/UX

12. Where should the section should be always?
13. Where does the "See all" sections send user to?
14. Are the 6 products should be shown in a carousel or in a fixed element (fixed grid)?
15. What does the buttons should be there? i.e. Wishlist, Name, sub category (As the main category is same according to the details), Seller rating, product rating, price, shipping country etc.
16. Should the sponsored ones (Paid users for the ads) have a label or badge for it?

### Clarifications on Technical aspects

17. Do all the browsers supports this related feature? What about the devices (Web view for devices, mobile view, tablet view)
18. Should this sections lazy load or on-demand load with the whole page. (Coz in lazy load scenarios we should do waiting for the elements on testing)
19. Is caching available for the related products section? If so how's the TTL?
20. What's the acceptable page reload time for the related products section?
21. Is there any API endpoints directly available for the testing purposes for the related products section?
22. How does the features mentioned works with poor network conditions?

### Clarifications for the Data and Scope

23. Does mentioned "same category" means uses the same exact category in eBay (Wallets - Men)? Or a broader range of available section? (eg. Fashion and accessories)
24. Are the sponsored products should be excluded or doesn't matter?
25. Are products with unavailable shipping addresses included in related products

---

## SECTION 02: Documentation for the Test Strategy

### 2.1 Objective

Make sure that the Related products section (Section for the best sellers) on the Ebay products page displays correctly as planned. Showing no more than 6 products, match the category correctly (as defined from above) and price range of the main product. Also showing the attention for the UX not only UI. Lastly the functionality as a vital point.

### 2.2 Scope

### In Scope

- Position of the related products in the PDP (Product detail page). And also how th visibility of the element works.
- A validator for the maximum amount of th products that should be added (maximum 6 in this case).
- Validation with the price range with the products shown in related section and with the main product.
- Relevance of the category used to show in this section.
- UI elements. i.e. images, titles, prices, wishlist button, "See All" section.
- Navigation: i.e. clicking on the product, "See All" link, back navigation
- Responsive behavior across different devices. (i.e. Desktop, Mobile, Tablet (if available))
- Edge cases: i.e. No results, no products available, wrong/ invalid search terms used
- Cross browser testing: i.e. Accessability across different web browsers (Chrome, Safari, Firefox, etc.).

### Out of scope

- Process of the payment and checkout flow
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
| Negative                  | Invalid inputs. Empty states. Boundary conditions                                                                        |
| Regression                | When PDP related functionalities or code changes, run a full suite                                                       |
| Cross-browser             | Chrome, Firefox, Safari                                                                                                  |
| Performance (Exploratory) | Check related products load times under throttled network. (This way can test the behavior under poor signal conditions) |

## 2.4 Testing Environment

- **URL:** https://www.ebay.com/
- **Browsers:** Chrome 120+, Firefox 120+, Safari 17+
- **Devices:** Desktop (1280x720), Tablet (768x1024), Mobile (390x844)
- **Network:** Standard broadband + Throttled (3G simulation)
- **User State:** User has been logged out. USer has been logged in

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

### 3.3 Test Dta

| DataSet              | Value                             | Purpose                      |
| -------------------- | --------------------------------- | ---------------------------- |
| Primary search term  | `Leather wallet`                  | Standard search for wallet   |
| Specific search term | `Men leather foldable wallet`     | Targeted product search      |
| Special characters   | `!@#$%^&\*()`                     | Negative: input invalidation |
| SQL injection        | `' OR 1=1: --`                    | Negative security check      |
| Unicode              | `钱包` (Wallet in Chinese)        | Negative: encoding check     |
| XSS Payload          | `<script>alert("xss")</script>`   | Negative: Security Check     |
| Whitespace           | `     `                           | Negative: Edge case          |
| Long string          | `a` x 500                         | Negative: Max length         |
| No results term      | `yyyyynoresultsproductgggggty123` | Negative: zero results       |

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

#### TC-005 | Functional | eBay homepage loads

- **Preconditions:** Related products section has the relevant correct Title
- **Steps:** 1. Check the heading for the section
- **Expected:** Something like "Similar sponsored items", "Similar items" or "Similar items Sponsored" or an equivalent is available.
- **Priority** P1

#### TC-006 | Functional | maximum amount of 6 products are available

- **Preconditions:** Related products section is available/visible.
- **Steps:** 1. Count all the product cards in related products section
- **Expected:** maximum of 6 products are available in the Related products section.
- **Priority** P1

#### TC-001 | Functional | eBay homepage loads

- **Preconditions:**
- **Steps:**
- **Expected:**
- **Priority**
