const axios = require("axios");

const teamId = "af3fd80a-475b-4ffa-88ec-20b0f4211db4";
const channelId =
  "19:AJZciBgKzwb8IK2ugVq9sFXJS7_OkKhEXf4rdsGbCss1@thread.tacv2";
const subscriptionKey = "5d383bd8ae444936960c8a52f3eeb19b";
const ticketUrl = "https://microsoft8994.zendesk.com/agent/tickets";

module.exports = async function(context, req) {
  const callZendesk = async () => {
    var zendeskData = JSON.stringify({
      ticket: {
        comment: {
          body: req.body.comment,
        },
        priority: req.body.priority,
        subject: req.body.subject,
      },
    });

    var zendeskConfig = {
      method: "post",
      url:
        "https://cf-bugbash-prodrelease-test-1.preview.int-azure-api.net/zendesk/v2/tickets",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json",
      },
      data: zendeskData,
    };
    return axios(zendeskConfig);
  };

  const callTeams = async (data) => {
    const message = `
      New Ticket Created | Subject: "${data.ticket.subject}" | 
      Comments: "${data.ticket.description}" | Priority: ${data.ticket.priority} | <a href=${ticketUrl}/${data.ticket.id}> View in web </a>
    `;
    var teamsData = JSON.stringify({
      body: {
        contentType: "html",
        content: message,
      },
    });
    var teamsConfig = {
      method: "post",
      url: `https://cf-bugbash-prodrelease-test-1.preview.int-azure-api.net/teams/teams/${teamId}/channels/${channelId}/messages`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      data: teamsData,
    };
    return axios(teamsConfig);
  };

  var ticketId;
  var messageId;

  await callZendesk()
    .then((response) => {
      ticketId = response.data.ticket.id;
      return callTeams(response.data);
    })
    .then((teamsResponse) => {
      messageId = teamsResponse.data.id;
    });

  context.res.json({
    id: ticketId.toString(),
    mid: messageId,
  });
};
