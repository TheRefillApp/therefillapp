import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, update } from 'firebase/database';
import {
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
    <div>
      <TableContainer component={Paper} style={{ borderRadius: '10px', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="40%"><Typography variant="h6">Item</Typography></TableCell>
              <TableCell width="60%"><Typography variant="h6">Status</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell><Typography variant="h5">{translator[item.itemName]}</Typography></TableCell>
                <TableCell style={{ padding: '8px' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleStatusClick(item)}
                    disabled={item.status === 'Filled'}
                    style={{
                      backgroundColor: item.status === 'Refill' ? 'red' : 'darkgreen',
                      color: 'white',
                      height: '50px',
                      fontSize: '1.2rem',
                      textTransform: 'none'
                    }}
                  >
                    {item.status}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog for Status Change */}
      <Dialog
        open={confirmPopup.show}
        onClose={() => setConfirmPopup({ show: false, itemId: null })}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this as "Filled"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPopup({ show: false, itemId: null })} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RefillTable;
