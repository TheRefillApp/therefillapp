import React, { useState, useEffect } from "react";
import { Typography, Container, Box, Paper } from "@mui/material";
import Confetti from "react-confetti";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function ThankYou() {
    const { innerWidth: width, innerHeight: height } = window;
    const [confettiPieces, setConfettiPieces] = useState(300); // Initial burst of confetti

    useEffect(() => {
      // Stop the confetti after 3 seconds
      const timer = setTimeout(() => {
        setConfettiPieces(0);
      }, 3000);
      return () => clearTimeout(timer); // Clean up the timer on unmount
    }, []);

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
          <Confetti width={width} height={height} numberOfPieces={confettiPieces} />
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
              <CheckCircleIcon
                sx={{
                fontSize: "70px",
                color: "green",
                }}
              />
              <Typography
                fontSize={30}
                align="center"
                sx={{
                  color: "#000",
                  fontFamily: "'Josefin Sans', sans-serif",
                }}
                padding={.5}
    
              >
                Thank you!
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
                Staff has been notified! This station should refill within 10&nbsp;-&nbsp;15 minutes.
              </Typography>
            </Box>
          </Paper>
        </Container>
      );
}

export default ThankYou;
