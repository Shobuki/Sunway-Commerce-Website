import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Paper
} from '@mui/material';

import { 
  Search, 
  DateRange, 
  ArrowUpward, 
  ArrowDownward,
  Close
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import Navbar from '../../components/header/navbar';

const ListTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/admin/salesorder/getbyuser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserId: 1 })
        });
        
        if (!response.ok) throw new Error('Gagal memuat transaksi');
        
        const { data } = await response.json();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions
    .filter(transaction => 
      transaction.SalesOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.Status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(transaction => {
      if (!startDate || !endDate) return true;
      const transactionDate = new Date(transaction.CreatedAt);
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    })
    .sort((a, b) => sortAsc 
      ? new Date(a.CreatedAt) - new Date(b.CreatedAt)
      : new Date(b.CreatedAt) - new Date(a.CreatedAt)
    );

  const getStatusColor = (status) => {
    switch(status) {
      case 'NEEDS_REVISION': return 'error';
      case 'APPROVED_EMAIL_SENT': return 'success';
      default: return 'primary';
    }
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'dd MMMM yyyy HH:mm');
  };

  const calculateTotal = (details) => {
    return details.reduce((sum, item) => sum + item.FinalPrice, 0);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Dari Tanggal"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Sampai Tanggal"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <IconButton 
                onClick={() => setSortAsc(!sortAsc)}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                {sortAsc ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </Grid>
          </Grid>
        </Paper>

        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <List sx={{ bgcolor: 'background.paper' }}>
            {filteredTransactions.map((transaction) => (
              <ListItem 
                key={transaction.Id}
                button 
                onClick={() => setSelectedTransaction(transaction)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemText
                  primary={`Order #${transaction.SalesOrderNumber || 'N/A'}`}
                  secondary={formatDate(transaction.CreatedAt)}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label={transaction.Status}
                  color={getStatusColor(transaction.Status)}
                  sx={{ mr: 2 }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Rp {calculateTotal(transaction.SalesOrderDetails).toLocaleString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}

        <Dialog 
          open={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Detail Transaksi
            <IconButton onClick={() => setSelectedTransaction(null)}>
              <Close />
            </IconButton>
          </DialogTitle>
          
          {selectedTransaction && (
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Order Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informasi Order
                  </Typography>
                  <Typography>Nomor Order: {selectedTransaction.SalesOrderNumber}</Typography>
                  <Typography>Tanggal: {formatDate(selectedTransaction.CreatedAt)}</Typography>
                  <Typography>Status: 
                    <Chip 
                      label={selectedTransaction.Status}
                      color={getStatusColor(selectedTransaction.Status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>

                {/* Dealer Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informasi Dealer
                  </Typography>
                  <Typography>Nama: {selectedTransaction.Dealer.CompanyName}</Typography>
                  <Typography>Region: {selectedTransaction.Dealer.Region}</Typography>
                </Grid>

                {/* Items List */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Daftar Item
                  </Typography>
                  {selectedTransaction.SalesOrderDetails.map((detail) => (
                    <Paper key={detail.Id} sx={{ p: 2, mb: 2 }}>
                      <Typography fontWeight="bold">{detail.ItemCode.Name}</Typography>
                      <Typography>Jumlah: {detail.Quantity}</Typography>
                      <Typography>Harga Satuan: Rp {detail.Price.toLocaleString()}</Typography>
                      <Typography>Total: Rp {detail.FinalPrice.toLocaleString()}</Typography>
                    </Paper>
                  ))}
                </Grid>

                {/* Total */}
                <Grid item xs={12}>
                  <Typography variant="h6" textAlign="right">
                    Total Order: Rp {calculateTotal(selectedTransaction.SalesOrderDetails).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
          )}
          
          <DialogActions>
            <Button onClick={() => setSelectedTransaction(null)}>Tutup</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ListTransaction;