const { Tool } = require('langchain/tools');
const intelequiaCountTokens = require('../../intelequiaTokenCount')

class BingSearch extends Tool {

  constructor(fields){
    super();
    this.name = 'bing-search';
    this.description = 'Use the \'bing-search\' tool to retrieve search results relevant to your input';
    this.userId = fields.userId;
    this.url = process.env.BING_SEARCH_V7_ENDPOINT + "/v7.0/search";
    this.method = "GET";
    this.apiKey = process.env.BING_SEARCH_V7_SUBSCRIPTION_KEY
  }

  async _call(data){

    var userEmail = data.userEmail;
    if (typeof data == "string"){
      const User = require('~/models/User');
      const { email } = await User.findOne({ _id: this.userId }).lean();
      userEmail = email;
    }

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
    const searchResult = JSON.stringify(json)
    global.appInsights.trackEvent({
      name: 'Plugin',
      properties: {
        toolName: "bing-search",
        userEmail: userEmail ,
        assistantId: data.assistant ?? "",
        messageLength: searchResult.length
      },
    });

    return searchResult;
  }
}

module.exports = BingSearch;