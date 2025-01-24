import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, update } from 'firebase/database';
import {Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Paper, Typography
} from '@mui/material';

function RefillTable() {
  const [items, setItems] = useState([]);
  const [confirmPopup, setConfirmPopup] = useState({ show: false, itemId: null });

  const translator = {"regularmilk": "Regular Milk", "skimmilk": "Skim Milk", "chocolatemilk": "Chocolate Milk"}


  // Fetch data from Firebase on component mount and set up real-time listener
  useEffect(() => {
    const itemsRef = ref(database, 'items');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setItems(formattedData);
      }
    });
  }, []);

  // Listen for changes to 'requests' and update 'status' accordingly
  useEffect(() => {
    items.forEach((item) => {
      const itemRef = ref(database, `items/${item.id}`);
      //if (item.requests > 0 && item.status !== 'Refill') {
       // update(itemRef, { status: 'Refill' });
      //} else if (item.requests === 0 && item.status !== 'Filled') {
        //update(itemRef, { status: 'Filled' });
      //}
    });
  }, [items]);

  const handleStatusClick = (item) => {
    if (item.status === "Refill") {
      setConfirmPopup({ show: true, itemId: item.id });
    }
  };

  const confirmStatusChange = () => {
    if (confirmPopup.itemId) {
      const itemRef = ref(database, `items/${confirmPopup.itemId}`);
      update(itemRef, { status: "Filled", requests: 0, phones: {0:0} });
    }
    setConfirmPopup({ show: false, itemId: null });
  };

  return (
    <Container 
    maxWidth={false}
    disableGutters
    sx={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#2d2d34',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: 0,
      left: 0,
      fontFamily: "'Josefin Sans', sans-serif",
     //perspective: '1500px' // Add perspective for 3D effect
    }}>
     <TableContainer
  component={Paper}
  sx={{
    borderRadius: '16px 16px 16px 16px', // Rounded corners only for the bottom-right
    overflow: 'hidden', // Ensure content stays within the container
    backgroundColor: '#34353c', // Table container background
    boxShadow: `
      inset 0 0 1px 0.5px hsla(0, 0%, 100%, 0.075), /* Increased size and opacity */
      /* shadow ring 👇 */
      0 0 0 2px hsla(0, 0%, 0%, 0.2), /* Increased ring thickness and opacity */
      /* multiple soft shadows 👇 */
      0 0.6px 0.8px hsla(0, 0%, 0%, 0.2), /* Slightly larger and darker */
      0 1.8px 3px hsla(0, 0%, 0%, 0.25), /* Adjusted to be more prominent */
      0 7px 12px hsla(0, 0%, 0%, 0.3); /* More intense large shadow */
    `,
    width: '80%', // Adjust table width
    margin: '0 auto', // Center horizontally
    position: 'relative',
  }}
>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell
          sx={{
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: '2.5rem', // Larger font size
            fontWeight: 700, // Bold text
            padding: '36px 36px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          Item
        </TableCell>
        <TableCell
          sx={{
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: '2.5rem', // Larger font size
            fontWeight: 700, // Bold text
            padding: '36px 36px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          Status
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow
          key={item.id}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          <TableCell
            sx={{
              color: '#fff',
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: '2.5rem', // Larger font size
              fontWeight: 700, // Bold text
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {translator[item.itemName]}
          </TableCell>
          <TableCell
            sx={{
              color: '#fff',
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: '1.6rem', // Larger font size
              fontWeight: 700, // Bold text
              padding: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Button
  variant="contained"
  fullWidth
  onClick={() => handleStatusClick(item)}
  disabled={item.status === 'Filled'}
  sx={{
    backgroundColor: item.status === 'Refill' ? '#e53935' : '#4caf50',
    color: '#ffffff',
    height: '80px', // Keep button height
    width: '400px', // Set a fixed width
    fontSize: '2rem',
    fontFamily: "'Josefin Sans', sans-serif",
    fontWeight: 700,
    textTransform: 'none',
    borderRadius: '40px', // Adjusted for a cleaner look
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: item.status === 'Refill' ? '#c62828' : '#388e3c',
      transform: 'translateY(-2px)',
    },
    '&.Mui-disabled': {
      backgroundColor: item.status === 'Filled' ? '#4caf50' : '#9e9e9e',
      color: '#ffffff',
      opacity: 1,
    },
  }}
>
  {item.status === 'Refill' ? 'Refill' : 'Filled'}
</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>



      <Dialog
        open={confirmPopup.show}
        onClose={() => setConfirmPopup({ show: false, itemId: null })}
        PaperProps={{
          style: {
            backgroundColor: '#1E1E1E',
            color: '#fff',
            borderRadius: '16px',
            padding: '8px',
            fontFamily: "'Josefin Sans', sans-serif",
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <DialogTitle style={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px',
          fontSize: '1.5rem',
          fontWeight: 300
        }}>
          Confirm Status Change
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ 
            color: '#e0e0e0', 
            marginTop: '1.5rem',
            fontSize: '1.1rem',
            fontWeight: 300
          }}>
            Are you sure you want to mark this as "Filled"?
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: '24px' }}>
          <Button 
            onClick={() => setConfirmPopup({ show: false, itemId: null })} 
            style={{
              color: '#fff',
              backgroundColor: '#424242',
              borderRadius: '8px',
              padding: '8px 24px',
              fontFamily: "'Josefin Sans', sans-serif",
              textTransform: 'none',
              '&:hover': { 
                backgroundColor: '#505050',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmStatusChange} 
            variant="contained" 
            color="primary" 
            autoFocus
            style={{
              backgroundColor: '#5c6bc0',
              borderRadius: '8px',
              padding: '8px 24px',
              fontFamily: "'Josefin Sans', sans-serif",
              textTransform: 'none',
              '&:hover': { 
                backgroundColor: '#3f51b5',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RefillTable;
