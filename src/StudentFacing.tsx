import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ref, onValue, update, get } from 'firebase/database';

import { database } from './firebase';

import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

interface Item {
  itemName: string;
  phones?: Record<string, string>;
}

function StudentFacing() {
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const station = searchParams.get('station') || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle phone number submission logic here
    console.log('Phone number submitted:', phoneNumber);
  };

  const handlePhoneSubmit = () => {
    const itemRef = ref(database, `items`);
    get(itemRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const matchingItem = Object.entries(data).find(([_, item]) => 
          (item as Item).itemName === station
        );
        
        if (matchingItem) {
          const [key, item] = matchingItem as [string, Item];
          const currentPhones = item.phones || {};
          const newPhones = {
            ...currentPhones,
            [Object.keys(currentPhones).length]: phoneNumber
          };
          
          update(ref(database, `items/${key}`), {
            phones: newPhones
          });
          
          // Clear phone number after submission
          setPhoneNumber('');
        }
      }
    });
    setOpenDialog(false);
  };

  const handleConfirmClick = () => {
    // First set status to Refill
    const itemRef = ref(database, `items`);
    get(itemRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const matchingItem = Object.entries(data).find(([_, item]) => 
          (item as Item).itemName === station
        );
        
        if (matchingItem) {
          const [key] = matchingItem;
          update(ref(database, `items/${key}`), {
            status: "Refill"
          });
        }
      }
    });
    // Then open dialog for phone number
    setOpenDialog(true);
  };

  const translator = {"regularmilk": "the Regular milk", "skimmilk": "the Skim milk", "chocolatemilk": "the Chocolate milk"}

  return (
    <Container
  maxWidth={false}
  disableGutters
  sx={{
    height: '100vh',
    width: '100vw',
    backgroundColor: '#000000', // Ensure it's black
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    position: 'absolute', // Ensure it covers the viewport
    top: 0,
    left: 0,
  }}
>
      <Paper 
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: '400px',
          padding: 4,
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          margin: '0 16px'
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Typography 
            variant="h4" 
            align="center"
            sx={{ 
              color: '#ffffff',
              marginBottom: 2
            }}
          >
            Is {translator[station]} empty?
          </Typography>

          <Button 
            type="button"
            variant="contained"
            size="large"
            onClick={handleConfirmClick}
            sx={{
              backgroundColor: '#90caf9', 
              color: '#000',
              '&:hover': {
                backgroundColor: '#64b5f6',
              },
              padding: '12px',
              fontSize: '1.1rem'
            }}
          >
            Confirm
          </Button>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          <Typography sx={{ color: '#000', mb: 2 }}>
            OPTIONAL: Enter your phone number to be notified when this item is refilled
          </Typography>
          <TextField
            fullWidth
            label="Phone Number"
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Skip</Button>
          <Button onClick={handlePhoneSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StudentFacing;
