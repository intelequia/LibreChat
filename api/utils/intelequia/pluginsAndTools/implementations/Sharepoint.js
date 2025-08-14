const { Tool } = require('langchain/tools');

const axios = require('axios');

class Sharepoint extends Tool {

  constructor(fields) {
    super();
    this.name = 'sharepoint';
    this.description = 'Use the \'sharepoint\' tool to retrieve search results from Graph';
    this.userId = fields.userId;
    this.sharepointSiteURL = fields['MS_SHAREPOINT_SITE_URL']
  }


  /**
   * Call to a Microsoft Graph endpoint for sharepoint
   * @Organization Intelequia
   * @Author Pablo Suárez Romero
   * @returns 
   */

  async createClient(userEmail, userQuery) {
    const cachedToken = global.myCache.get( userEmail + "-token" )
    // "intelequia.sharepoint.com,76093170-463a-458b-b5f7-f4d4cf3a5381,1e7947c7-1755-49c2-9110-47ae348116f7"
    const sharepointSitePath = `path:\"${this.sharepointSiteURL}\"`
    const requestData = {
      requests: [
        {
          entityTypes: [
            "driveItem",
            "listItem",
            "site"
          ],
          query: {
            queryString: `${userQuery} ${sharepointSitePath}`,
          },
          size: 10
        }
      ]
    };

    try {
      const response = await axios.post("https://graph.microsoft.com/v1.0/search/query", requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cachedToken}`
        }
      });

      return JSON.stringify(response.data);
    } catch (error) {
      console.error('Error en la llamada a Graph API:', error);
      if(error.status == 403)
        return "You dont have permission"
      if(error.status == 401 && userAccessToken == undefined)
        return "Your Sesion has expired, Log in again"
    }
  }

  async _call(data) {
    var userEmail = data.userEmail;
    if (typeof data == "string"){
      const { findUser } = require('~/models');
      const { email } = await findUser({ _id: this.userId });
      userEmail = email;
    }

    const userQuery = data.query ?? data;
    const search = await this.createClient(userEmail, userQuery);

    global.appInsights.trackEvent({
      name: 'Plugin',
      properties: {
        toolName: "sharepoint",
        userEmail: userEmail,
        assistantId: data.assistant ?? "",
        tokens:0,
        siteURL: this.sharepointSiteURL
      },
    });
    return search
  }
}

module.exports = Sharepoint;