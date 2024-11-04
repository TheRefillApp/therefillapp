import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, update, push, remove } from 'firebase/database';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Paper, Typography, TextField
} from '@mui/material';

function RefillTable() {
  const [items, setItems] = useState([]);
  const [confirmPopup, setConfirmPopup] = useState({ show: false, itemId: null });
  const [addPopup, setAddPopup] = useState(false);
  const [deletePopup, setDeletePopup] = useState({ show: false, itemId: null });
  const [newItemName, setNewItemName] = useState('');

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
      if (item.requests > 0 && item.status !== 'Refill') {
        update(itemRef, { status: 'Refill' });
      } else if (item.requests === 0 && item.status !== 'Filled') {
        update(itemRef, { status: 'Filled' });
      }
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
      update(itemRef, { status: "Filled", requests: 0 });
    }
    setConfirmPopup({ show: false, itemId: null });
  };

  const handleAddNewItem = () => {
    if (newItemName.trim()) {
      const itemsRef = ref(database, 'items');
      push(itemsRef, {
        itemName: newItemName,
        requests: 1,
        timeAgo: 'Just now',
        status: 'Refill'
      })
      .then(() => {
        setAddPopup(false);
        setNewItemName('');
      })
      .catch((error) => {
        console.error("Error adding new item: ", error);
      });
    }
  };

  // Handle delete click - shows delete confirmation dialog
  const handleDeleteClick = (itemId) => {
    setDeletePopup({ show: true, itemId });
  };

  // Confirm delete and remove item from Firebase
  const confirmDelete = () => {
    if (deletePopup.itemId) {
      const itemRef = ref(database, `items/${deletePopup.itemId}`);
      remove(itemRef)
      .then(() => {
        setDeletePopup({ show: false, itemId: null });
      })
      .catch((error) => {
        console.error("Error deleting item: ", error);
      });
    }
  };

  return (
    <div>
      <TableContainer component={Paper} style={{ borderRadius: '10px', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="h6">Item</Typography></TableCell>
              <TableCell><Typography variant="h6">Requests</Typography></TableCell>
              <TableCell><Typography variant="h6">Status</Typography></TableCell>
              <TableCell><Typography variant="h6">Delete</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{`${item.requests} requests${item.requests === 0 ? "" : `, most recent ${item.timeAgo} ago`}`}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleStatusClick(item)}
                    disabled={item.status === 'Filled'}
                    style={{
                      backgroundColor: item.status === 'Refill' ? 'hotpink' : 'darkgreen',
                      color: 'white'
                    }}
                  >
                    {item.status}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDeleteClick(item.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Item Button */}
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: '20px' }}
        onClick={() => setAddPopup(true)}
      >
        Add New Item
      </Button>

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletePopup.show}
        onClose={() => setDeletePopup({ show: false, itemId: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletePopup({ show: false, itemId: null })} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Item Dialog */}
      <Dialog open={addPopup} onClose={() => setAddPopup(false)}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            fullWidth
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPopup(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddNewItem} color="primary">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RefillTable;
