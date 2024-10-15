const { Tool } = require('langchain/tools');

class MicrosoftGraph extends Tool {
  constructor(fields = {}) {
    super(fields);
    /** @type {boolean} Used to initialize the Tool without necessary variables. */
    this.override = fields.override ?? false;
    /** @type {boolean} Necessary for output to contain all image metadata. */
    this.returnMetadata = fields.returnMetadata ?? false;

    this.name = 'Dataverse';
    this.description = 'Use the Dataverse tool to coonect to your own Dataverse instance';
    this.apiKey = undefined;
    this.override = fields.override ?? false;
    let config = { apiKey };

    if (process.env.ENABLE_MS_GRAPH && process.env.ENABLE_MS_GRAPH == "true") {
      config.url = process.env.DATAVERSE_LOGICAPPS_URL;
      config.method = "POST";
      config.headers = { 'Content-Type' : 'application/json'};
    }
    
    this.config = config;

    if (!this.override && !this.apiKey) {
      throw new Error(
        'Missing AZURE_ASSISTANTS_API_KEY, INSTANCE_NAME, or AZURE_ASSISTANTS_FUNCTIONS_URL environment variable.',
      );
    }

    if (this.override) {
      return;
    }
  }

  async _call(data) {

    if ( process.env.ENABLE_MS_GRAPH && process.env.ENABLE_MS_GRAPH == "true" ) {
      const url = this.config.url;
      const method = this.config.method;
      const headers = this.config.headers;
      const body = data.toolInput;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${json.error.message}`);
      }

      return JSON.stringify(json);
    }
  }
}

module.exports = MicrosoftGraph;
