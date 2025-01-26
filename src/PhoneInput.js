import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ref, update, get } from "firebase/database";
import { database } from "./firebase";
import { TextField, Button, Box, Typography, Container, Paper } from "@mui/material";

function PhoneInput() {
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();
  const station = searchParams.get("station") || "";
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/; 
    if (!phoneRegex.test(phoneNumber)) {
      setError(true);
      return;
    }
    const itemRef = ref(database, `items`);
    get(itemRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const matchingItem = Object.entries(data).find(([_, item]) =>
          (item.itemName === station)
        );

        if (matchingItem) {
          const [key, item] = matchingItem;
          const currentPhones = item.phones || {};
          const newPhones = {
            ...currentPhones,
            [Object.keys(currentPhones).length]: phoneNumber,
          };

          update(ref(database, `items/${key}`), { phones: newPhones });
        }
      }
    });
    navigate("/thank-you");
  };

  const handleSkip = () => {
    navigate("/thank-you");
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(145deg,#c2ffde,#7bd3f9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        margin: 0,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "70%",
          maxWidth: "70%",
          padding: 4,
          backgroundColor: "fff",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(145, 144, 144, 0.5), 0 0 8px rgba(90, 90, 90, 0.2)",
          animation: "fade-in 0.5s ease-in-out",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography
            fontSize={30}
            align="center"
            sx={{
              color: "#000",
              fontFamily: "'Josefin Sans', sans-serif",
            }}
            padding={.5}

          >
            Get Notified?
          </Typography>
          <Typography
            fontSize={20}
            align="center"
            sx={{
              color: "#000",
              fontFamily: "'Josefin Sans', sans-serif",
            }}
            padding={.5}
          >
            Get notified when your milk has been refilled
          </Typography>
          <TextField
            value={phoneNumber}
             onChange={(e) => {
                setPhoneNumber(e.target.value)
                setError(false);
            }}
            label="Phone Number (Optional)"
            error={error}
            helperText={error ? "Please enter a valid phone number" : ""}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row", 
              gap: 2, 
              justifyContent: "space-between", 
            }}
          >
          <Button 
            onClick={handleSkip}
            style={{ fontSize: "1.2rem", color: '#0096ff', fontWeight: 400, textTransform: 'none' }}
          >Skip</Button>
          <Button
            type="button"
            variant="contained"
            size="large"
            onClick={handleSubmit}
            sx={{
              background: "#0096ff",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "1.2rem",
              fontWeight: 400,
              padding: "12px 12",
              textTransform: "none",
              fontSize: "1.2rem",
              transition: "all 0.3s",
              "&:hover": {
                background: "#0096ff",
                transform: "scale(1.02)",
              },
              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            Submit
          </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default PhoneInput;

