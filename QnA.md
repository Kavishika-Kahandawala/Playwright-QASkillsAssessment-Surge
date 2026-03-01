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

