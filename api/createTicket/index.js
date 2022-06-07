const axios = require("axios");

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
      url: `${process.env.ApiURL}/zendesk/v2/tickets`,
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.SubscriptionKey,
        "Content-Type": "application/json",
      },
      data: zendeskData,
    };
    return axios(zendeskConfig);
  };

  const callTeams = async (data) => {
    const message = `
      New Ticket Created | Subject: "${data.ticket.subject}" | 
      Comments: "${data.ticket.description}" | Priority: ${data.ticket.priority} | <a href=${process.env.TicketUrl}/${data.ticket.id}> View in web </a>
    `;
    var teamsData = JSON.stringify({
      body: {
        contentType: "html",
        content: message,
      },
    });
    var teamsConfig = {
      method: "post",
      url: `${process.env.ApiURL}/teams/teams/${process.env.TeamId}/channels/${process.env.ChannelId}/messages`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.SubscriptionKey,
      },
      data: teamsData,
    };
    return axios(teamsConfig).catch((e) => context.log(e.message));
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
