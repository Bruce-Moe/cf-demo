import styles from "./App.module.css";
import { Container, Row, Col } from "react-bootstrap";
import React, { useState } from "react";
import {
  FontSizes,
  Text,
  TextField,
  Dropdown,
  DefaultButton,
  PrimaryButton,
  DefaultPalette,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import axios from "axios";

function App() {
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");
  const [priority, setPriority] = useState("");

  const [ticketId, setTicketId] = useState("");
  const [messageId, setMessageId] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const [loaded, setLoaded] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paymentLoaded, setPaymentLoaded] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoaded(false);
      setSuccess(false);
      await axios
        .post("/api/createTicket", {
          subject: subject,
          comment: comment,
          priority: priority.toLowerCase(),
        })
        .then((response) => {
          setTicketId(response.data.id);
          setMessageId(response.data.mid);
          setLoaded(true);
          setSuccess(true);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      setPaymentLoaded(false);
      setPaymentSuccess(false);
      await axios
        .post("/api/makePayment", {
          messageId: messageId,
          ticketId: ticketId,
        })
        .then((response) => {
          setPaymentId(response.data.paymentId);
          setPaymentLoaded(true);
          setPaymentSuccess(true);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const options = [
    { key: "urgent", text: "Urgent" },
    { key: "high", text: "High" },
    { key: "normal", text: "Normal" },
    { key: "low", text: "Low" },
  ];

  return (
    <Container
      style={{
        height: "100vh",
      }}
      fluid
    >
      <Row>
        <Col className={styles.edge}></Col>
        <Col xs={5} className={styles.middle + " mt-5"}>
          <Text style={{ fontSize: FontSizes.xxLargePlus }} className="mb-3">
            {" "}
            Intern Feedback Portal{" "}
          </Text>
          <TextField
            placeholder="Enter subject"
            label="Subject"
            required
            onChange={(event, newValue) => setSubject(newValue)}
            className="mb-2"
          />
          <TextField
            placeholder="Enter comments"
            label="Comments"
            multiline
            autoAdjustHeight
            required
            className="mb-2"
            onChange={(event, newValue) => {
              setComment(newValue);
            }}
          />
          <Dropdown
            placeholder="Select priority"
            label="Priority"
            required
            onChange={(event, selectedOption) => {
              setPriority(selectedOption.key);
            }}
            options={options}
            className="mb-5"
          />
          {loaded ? (
            <DefaultButton
              className="mb-4"
              onClick={(e) => handleSubmit(e)}
              variant="primary"
            >
              Submit
            </DefaultButton>
          ) : (
            <Spinner size={SpinnerSize.large} />
          )}

          {success ? (
            <>
              <Text style={{ color: DefaultPalette.themePrimary }}>
                {" "}
                Successfully created Zendesk ticket and sent message to Teams!
              </Text>
              <Text> Ticket ID: {ticketId}</Text>
              <Text style={{ fontWeight: "bold" }}>
                {" "}
                To resolve this ticket, please pay $20 to the admin{" "}
              </Text>

              {paymentLoaded ? (
                <PrimaryButton
                  onClick={(e) => handlePayment(e)}
                  className="mt-3 mb-3"
                >
                  {" "}
                  Pay with Stripe
                </PrimaryButton>
              ) : (
                <Spinner size={SpinnerSize.large} />
              )}
              {paymentSuccess ? (
                <>
                  <Text style={{ color: DefaultPalette.themePrimary }}>
                    {" "}
                    Successfully created Payment Intent!
                  </Text>
                  <Text> Payment Intent ID: {paymentId}</Text>
                </>
              ) : null}
            </>
          ) : null}
        </Col>
        <Col className={styles.edge}></Col>
      </Row>
    </Container>
  );
}

export default App;
