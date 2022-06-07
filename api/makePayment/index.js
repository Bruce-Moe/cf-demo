const axios = require("axios");
const qs = require("qs");

const paymentsUrl = "https://connect.stripe.com/payments";

module.exports = async function(context, req) {
  const callStripe = async () => {
    var data = qs.stringify({
      amount: "2000",
      currency: "usd",
      description: "Zendesk Ticket ID: " + req.body.ticketId,
    });
    var stripeConfig = {
      method: "post",
      url: `${process.env.ApiURL}/stripe/v1/payment_intents`,
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.SubscriptionKey,
        Accept: "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    return axios(stripeConfig);
  };

  const callTeams = async (data) => {
    const message = `
        Payment Intent submitted: <a href=${paymentsUrl}/${data.id}> View in web </a>
      `;
    var teamsData = JSON.stringify({
      body: {
        contentType: "html",
        content: message,
      },
    });
    var teamsConfig = {
      method: "post",
      url: `${process.env.ApiURL}/teams/teams/${process.env.TeamId}/channels/${process.env.ChannelId}/messages/${req.body.messageId}/replies`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.SubscriptionKey,
      },
      data: teamsData,
    };
    return axios(teamsConfig);
  };

  var paymentId;

  await callStripe().then((response) => {
    paymentId = response.data.id;
    return callTeams(response.data);
  });

  context.res.json({
    paymentId: paymentId,
  });
};
