import { gotScraping } from "got-scraping";

const targetUrl = "https://api.ecommerce.com/products";

async function main() {
  // 4. Each product on the API costs somewhere between $0 and $100,000.
  const PRODUCTS_DATALIST = [];
  let initialPrice = 0;
  let limitPrice = 100;
  let totalForThisPriceRange = null;

  const firstProductsSearchAttempt = await fetchProductsByPriceRange(
    initialPrice,
    limitPrice
  );
  totalForThisPriceRange = firstProductsSearchAttempt.total;

  while (totalForThisPriceRange === null || totalForThisPriceRange > 1000) {
    // keep searching the minimum price range with less than 1000 products
    const { total, products } = await fetchProductsByPriceRange(
      initialPrice,
      limitPrice - 10
    );
    totalForThisPriceRange = total;

    if (totalForThisPriceRange < 1000) {
      // has found a viable price range to scrape
      /* the products founded are added to the datalist, and now we are gonna search for the next viable price range betwen the previous max price as minimum price and its value plus 100 as the new max value */
      PRODUCTS_DATALIST.push(...products);
      initialPrice = limitPrice;
      limitPrice += 100;
      totalForThisPriceRange = null;
    }
  }
}

async function fetchProductsByPriceRange(
  minPrice: number,
  maxPrice: number
): Promise<{
  total: number;
  count: number;
  products: { name: string; price: string }[];
}> {
  const { body } = await gotScraping.get(targetUrl);
  const apiResponseAsJson = JSON.parse(body);
  return apiResponseAsJson;
}

main();
