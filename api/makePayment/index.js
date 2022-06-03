const axios = require("axios");
const qs = require("qs");

const teamId = "af3fd80a-475b-4ffa-88ec-20b0f4211db4";
const channelId =
  "19:AJZciBgKzwb8IK2ugVq9sFXJS7_OkKhEXf4rdsGbCss1@thread.tacv2";
const subscriptionKey = "5d383bd8ae444936960c8a52f3eeb19b";
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
      url:
        "https://cf-bugbash-prodrelease-test-1.preview.int-azure-api.net/stripe/v1/payment_intents",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
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
      url: `https://cf-bugbash-prodrelease-test-1.preview.int-azure-api.net/teams/teams/${teamId}/channels/${channelId}/messages/${req.body.messageId}/replies`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
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
