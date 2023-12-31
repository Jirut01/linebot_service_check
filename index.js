const line = require("@line/bot-sdk");
const express = require("express");
const axios = require("axios").default;
require("dotenv").config();
const moment = require("moment");
const app = express();
const channelAccessToken = process.env.ACCESS_TOKEN;
const channelSecret = process.env.SECRET_TOKEN;
const lineConfig = {
  channelAccessToken: channelAccessToken,
  channelSecret: channelSecret,
};

const client = new line.Client(lineConfig);
app.get("/", (req, res) => {
  return res.json({ status: "success" });
});

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    if (
      events[0].message.type == "text" &&
      events[0].message.text == "check service uat"
    ) {
      try {
        const response = await axios.get(
          "https://dev-health-gateway.inet.co.th/api/health"
        );
        events[0].data = response.data;
      } catch (error) {
        console.log("Error:", error.message);
      }
    } else if (
      events[0].message.type == "text" &&
      events[0].message.text == "check service dev"
    ) {
      try {
        const response = await axios.get(
          "https://dev-health-gateway.inet.co.th/api/health"
        );
        events[0].data = response.data;
      } catch (error) {
        console.log("Error:", error.message);
      }
    }
    return events.length > 0
      ? await Promise.all(events.map((item) => handleEvent(item)))
      : res.status(200).send("OK");
  } catch (error) {
    res.status(500).end();
  }
});

const handleEvent = async (event) => {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  } else if (
    event.type === "message" &&
    event.message.text === "check service uat"
  ) {
    const localDateTime = moment.utc(event.data.data.time).local();
    const formattedDateTime = localDateTime.format("DD/MM/YYYY HH:mm น.");
    const message = [
      {
        type: "text",
        text: "status zone uat",
      },
      {
        type: "text",
        text: `caching : ${event.data.data.caching} || maria_db : ${event.data.data.maria_db} || mongo_db : ${event.data.data.mongo_db} || time : ${formattedDateTime}`,
      },
    ];
    client.replyMessage(event.replyToken, message);
  } else if (
    event.type === "message" &&
    event.message.text === "check service dev"
  ) {
    const localDateTime = moment.utc(event.data.data.time).local();
    const formattedDateTime = localDateTime.format("DD/MM/YYYY HH:mm น.");
    const message = [
      {
        type: "text",
        text: "status zone dev",
      },
      {
        type: "text",
        text: `caching : ${event.data.data.caching} || maria_db : ${event.data.data.maria_db} || mongo_db : ${event.data.data.mongo_db} || time : ${formattedDateTime}`,
      },
    ];
    client.replyMessage(event.replyToken, message);
  } else {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "กรุณาพิมพ์อีกครั้ง",
    });
  }
};

app.listen(4000, () => {
  console.log("listening on port 4000");
});
