const yahooFinance = require("yahoo-finance2").default;

const getStockData = async (query) => {
  try {
    // For Indian stocks, adding ".NS" (NSE) or ".BO" (BSE) helps narrow the search.
    const searchQuery = query.includes(".") ? query : `${query}.NS`;

    console.log(`Searching for: ${searchQuery}...`);
    const searchResults = await yahooFinance.search(searchQuery);

    if (!searchResults.quotes || searchResults.quotes.length === 0) {
      console.log(`No results found for "${query}"`);
      return;
    }

    // Picking the most relevant match
    const bestMatch = searchResults.quotes[0];
    const symbol = bestMatch.symbol;
    const name = bestMatch.shortname || bestMatch.longname;

    console.log(`Found: ${name} (${symbol}) on ${bestMatch.exchDisp}`);

    // Fetching the detailed quote for the Indian symbol
    const quote = await yahooFinance.quote(symbol);

    console.log("--- Indian Market Data ---");
    console.log(
      `Current Price: ${
        quote.currency
      } ${quote.regularMarketPrice.toLocaleString("en-IN")}`
    );
    console.log(`Day High: ${quote.regularMarketDayHigh}`);
    console.log(`Day Low: ${quote.regularMarketDayLow}`);
    console.log(`Market Cap: ${quote.marketCap?.toLocaleString("en-IN")}`);
    console.log(`Exchange: ${quote.fullExchangeName}`);

    return quote;
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};


getStockData("Reliance");
