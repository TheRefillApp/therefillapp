import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ref, onValue, update, get } from "firebase/database";
import { database } from "./firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded"; 

import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

interface Item {
  itemName: string;
  phones?: Record<string, string>;
  timeAgo?: string;
  status?: string;
  requests?: number;
}

function StudentFacing() {
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const station = searchParams.get("station") || "";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lockRef = ref(database, "requests-locked");
    const unsubscribe = onValue(lockRef, (snapshot) => {
      setIsLocked(snapshot.val() === true);
    });
    return () => unsubscribe();
  }, []);
  if (isLocked === null) {
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
    ></Container>
    );
  }
  if (isLocked) {
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          <CancelRoundedIcon
            sx={{
              fontSize: 100, // Big icon
              color: "#d32f2f", // Red color
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
            Not Being Refilled
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
            We're sorry, the dining hall is closing soon and we are no longer refilling this item.
          </Typography>
        </Box>
      </Paper>
    </Container>
    );
  }

  interface ConfirmResponse {
    success?: boolean;
    message?: string;
    error?: string;
  }
  
  const handleConfirmClick = async () => {
    const functions = getFunctions();
    const handleConfirmClickFunc = httpsCallable<{ station: string }, ConfirmResponse>(
      functions, 
      "handleConfirmClick"
    );

    setLoading(true);
  
    try {
      const response = await handleConfirmClickFunc({ station });
      const data = response.data as ConfirmResponse; // Explicitly cast response data
  
      if (data.success) {
        console.log("Status updated successfully:", data.message);
      } else {
        console.error("Error updating status:", data.error);
      }
    } catch (error) {
      console.error("Function call failed:", error);
    }
    setLoading(false);
    navigate("/phone-input" + `?station=${station}`);
  };

  const translator = { 
    "2percentmilk1": ["2% Milk", "Station 1"], 
    "skimmilk1": ["Skim Milk", "Station 1"], 
    "chocolatemilk1": ["Chocolate Milk", "Station 1"], 
    "2percentmilk2": ["2% Milk", "Station 2"], 
    "skimmilk2": ["Skim Milk", "Station 2"], 
    "chocolatemilk2": ["Chocolate Milk", "Station 2"]
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          <Typography
            fontSize={30}
            align="center"
            sx={{
              color: "#000",
              fontFamily: "'Josefin Sans', sans-serif",
            }}
            padding={.5}
          >
            Confirm Action
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
            Is the {translator[station][0]} empty? Staff will be notified to refill it.
          </Typography>
          <Button
            type="button"
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleConfirmClick}
            sx={{
              background: "#0096ff",
              color: "#fff",
              width: "80%",
              minWidth: "241px",
              minHeight: "56.4px",
              borderRadius: "12px",
              fontWeight: 400,
              padding: "10px 12px",
              textTransform: "none",
              fontSize: "1.3rem",
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
            {loading ? <CircularProgress size={24} sx={{ color: "white"}} /> : "Confirm"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default StudentFacing;
