// Test Data for the process is added here. This way it will be more dynamic and easy to do the changes
// Explained in the markdown the use of most of these.

export const SearchTerms = {
  valid: {
    wallet: "Leather wallet",
    walletExact: "Men leather foldable wallet",
  },
  edge: {
    noItems:"yyyyynoresultsproductgggggty123",
    specialChars: "!@#$%^&*()",
    sqlInjection: "' OR 1=1: --",
    xss: '<script>alert("xss")</script>',
    emptyString: "",
    longString: "a".repeat(500),
    unicodeChars: "钱包",
    whiteSpaceOnly: "     ",
  },
};

export const priceRange = {
  tolerancePercent: 50,
};

export const RelatedProducts = {
  maxCount: 4,
  minCount: 1,
};

export const timeOuts = {
  short: 5000,
  medium: 15000,
  long: 30000,
};

export const EbayUrls = {
  home: "https://www.ebay.com/",
  searchBase: 'https://www.ebay.com/sch/i.html?_nkw='
};
