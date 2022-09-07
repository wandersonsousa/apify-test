import { gotScraping } from "got-scraping";

const targetUrl = "https://api.ecommerce.com/products";
const MAX_PRODUCT_PRICE = 100;

/*the test does not limit either the number of requests or by complexity of danger, could add 1 to each of the price ranges until find a viable one, but to be more flexible I have added this value as var*/
const STEP_SIZE = 10;

async function main() {
  const PRODUCTS_DATALIST = [];
  let initialPrice = 0;
  let limitPrice = 10;
  let totalForThisPriceRange = null;

  while (totalForThisPriceRange === null || totalForThisPriceRange > 1000) {
    // keep searching the minimum price range with less than 1000 products
    const { total, products } = await fetchProductsByPriceRange(
      initialPrice,
      limitPrice
    );
    totalForThisPriceRange = total;

    const FOUND_A_VIABLE_PRICERANGE = totalForThisPriceRange < 1000;
    if (FOUND_A_VIABLE_PRICERANGE) {
      if (MAX_PRODUCT_PRICE === limitPrice) {
        // ALL PRODUCTS ARE EXTRACTED
        return PRODUCTS_DATALIST;
      }

      // the products founded are added to the datalist, and now we are gonna search for the next viable price range
      PRODUCTS_DATALIST.push(...products);
      initialPrice = limitPrice;
      totalForThisPriceRange = null;

      const NEXT_LIMIT_SIZE = limitPrice + STEP_SIZE;
      if (MAX_PRODUCT_PRICE - NEXT_LIMIT_SIZE < 0) {
        // if next limit price its bigger than max product price on ecommerce
        limitPrice = MAX_PRODUCT_PRICE - limitPrice;
      } else {
        limitPrice += NEXT_LIMIT_SIZE;
      }
    } else {
      limitPrice -= STEP_SIZE;
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
  const { body } = await gotScraping.get(
    `${targetUrl}?minPrice=${minPrice}&maxPrice=${maxPrice}`
  );
  const apiResponseAsJson = JSON.parse(body);
  return apiResponseAsJson;
}

main();
