const { Tool } = require('langchain/tools');

class BingSearch extends Tool {

  constructor(fields){
    super();
    this.name = 'bing-search';
    this.description = 'Use the \'bing-search\' tool to retrieve search results relevant to your input';
        
    if (process.env.ENABLE_BING_SEARCH && process.env.ENABLE_BING_SEARCH == "true") {
      this.url = process.env.BING_SEARCH_V7_ENDPOINT + "/v7.0/search";
      this.method = "GET";
      this.apiKey = process.env.BING_SEARCH_V7_SUBSCRIPTION_KEY
    }
  }

  async _call(data){
    if ( process.env.ENABLE_BING_SEARCH && process.env.ENABLE_BING_SEARCH == "true" ) {

      const query = data.query ? data.query : data;
      const market = process.env.BING_SEARCH_MARKET || "es-es";
      const count = process.env.BING_SEARCH_RESULT_COUNT || 10;
      const responseFilter = process.env.BING_SEARCH_FILTER || "Webpages";

      var sites = "";
      if(process.env.BING_SEARCH_SITE_SEARCH && process.env.BING_SEARCH_SITE_SEARCH !="")
        sites = "site:("+process.env.BING_SEARCH_SITE_SEARCH+")";

      const url = this.url +
        "?q=" + sites + query +
        "&mkt=" + market + 
        "&count=" + count + 
        "&responseFilter=" + responseFilter 

      const method = this.method;
      
      const headers = { 'Ocp-Apim-Subscription-Key': this.apiKey }

      const response = await fetch(url, {
        method,
        headers,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${json.error.message}`);
      }

      return JSON.stringify(json);
    }
  }
}

module.exports = BingSearch;