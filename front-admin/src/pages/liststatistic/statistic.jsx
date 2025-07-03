'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import numeral from 'numeral';
import useSWR from 'swr';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from '@/utils/axios';



// Komponen UI Kustom
const Button = ({ children, ...props }) => (
  <button {...props} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400">
    {children}
  </button>
);

const Card = ({ children, title }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
    {children}
  </div>
);

const statusOptions = [
  { value: 'APPROVED_EMAIL_SENT', label: 'Approved', color: '#4CAF50' },
  { value: 'REJECTED', label: 'Rejected', color: '#F44336' },
  { value: 'PENDING_APPROVAL', label: 'Pending', color: '#FFC107' },
];

const timeRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

const StatisticReport = () => {
  const defaultValues = {
    timeRange: 'all',
    startDate: '',
    endDate: '',
    DealerId: '',
    UserId: '',
    ItemCodeId: '',
    PartNumberId: '',
    ProductId: '',
    ProductCategoryId: '',
    Status: ''
  };
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues
  });

  const [showProductPopup, setShowProductPopup] = useState(false);
  const [showDatePopup, setShowDatePopup] = useState(false); // ❌ DI LUAR
  const timeRange = watch('timeRange');
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({
    dealers: [],
    users: [],
    itemCodes: [],
    partNumbers: [],
    products: [],
    categories: []
  });

  const [topN, setTopN] = useState(5);

  const [loadingAccess, setLoadingAccess] = useState(true);
  const [hasMenuAccess, setHasMenuAccess] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/admin/access/my-menu")
      .then(res => {
        const data = res.data;
        const allowed = (data || []).some(
          m => m.Name?.toLowerCase() === "statistic" && m.Access !== "NONE"
        );
        setHasMenuAccess(allowed);
        setLoadingAccess(false);
        if (!allowed) setTimeout(() => window.location.href = "/access-denied", 0);
      })
      .catch(() => {
        setHasMenuAccess(false);
        setLoadingAccess(false);
        setTimeout(() => window.location.href = "/access-denied", 0);
      });
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      const res = await axios.get('/api/admin/admin/report/transaction/fetchoption');
      setOptions(res.data.data);
    };
    fetchOptions();
  }, []);

  const fetcher = async ([_, body]) => {
    const res = await axios.post('/api/admin/admin/report/transaction', { filters: body });
    return res.data;
  };

  const { data, error, isLoading } = useSWR(['transaction-report', filters], fetcher);

  const formatRupiah = (value) => {
    // Handle nilai null/undefined
    if (!value) return 'Rp0';
    // Format angka dengan 2 desimal
    return `Rp${numeral(value).format('0,0.00')}`;
  };
  const formatStatistic = (value) => numeral(value).format('0,0');

  const handleFilter = (values) => {
    // Format tanggal sesuai kebutuhan API
    const formatDate = (date, isEndOfDay = false) => {
      if (!date || date === '') return null;
      return isEndOfDay
        ? dayjs(date).endOf('day').toISOString()
        : dayjs(date).startOf('day').toISOString();
    };

    // Bangun objek filter sesuai spesifikasi API
    const apiFilters = {
      // Filter utama
      ...(values.DealerId && { DealerId: Number(values.DealerId) }),
      ...(values.UserId && { UserId: Number(values.UserId) }),
      ...(values.ItemCodeId && { ItemCodeId: Number(values.ItemCodeId) }),
      ...(values.PartNumberId && { PartNumberId: Number(values.PartNumberId) }),
      ...(values.ProductId && { ProductId: Number(values.ProductId) }),
      ...(values.ProductCategoryId && { ProductCategoryId: Number(values.ProductCategoryId) }),
      ...(values.Status && { Status: values.Status }),

      // Handle time range
      ...(values.timeRange === 'custom' && {
        startDate: formatDate(values.startDate),
        endDate: formatDate(values.endDate, true)
      }),
      ...(values.timeRange !== 'custom' && values.timeRange !== 'all' && {
        timeRange: values.timeRange
      })
    };

    // Bersihkan objek dari nilai null/undefined
    const cleanFilters = Object.fromEntries(
      Object.entries(apiFilters).filter(([_, v]) => v !== null && v !== undefined)
    );

    setFilters(cleanFilters);
  };

  const handleReset = () => {
    reset(defaultValues);
    setFilters({});
  };

  const transactionData = data?.data || [];

  const statusData = statusOptions.map(option => ({
    name: option.label,
    value: transactionData.filter(t => t.Status === option.value).length,
    color: option.color
  }));
  const filterFields = [
    { name: 'DealerId', optionKey: 'dealers' },
    { name: 'UserId', optionKey: 'users' },
    { name: 'ItemCodeId', optionKey: 'itemCodes' },
    { name: 'PartNumberId', optionKey: 'partNumbers' },
    { name: 'ProductId', optionKey: 'products' },
    { name: 'ProductCategoryId', optionKey: 'categories' }
  ];

  // 1. Statistik Total per Dealer
  const calculateDealerTotals = () => {
    const dealerMap = new Map();

    transactionData.forEach(transaction => {
      const dealerId = transaction.Dealer?.Id;
      if (dealerId) {
        const total = dealerMap.get(dealerId) || 0;
        dealerMap.set(dealerId, total + transaction.TotalAmount);
      }
    });

    return Array.from(dealerMap).map(([id, total]) => ({
      dealerId: id,
      dealerName: transactionData.find(t => t.Dealer?.Id === id)?.Dealer?.Name || 'Unknown',
      total
    }));
  };

  // 2. Statistik Total per Produk
  const calculateProductTotals = () => {
    const productMap = new Map();

    transactionData.forEach(transaction => {
      transaction.Details.forEach(detail => {
        const productId = detail.Product;
        const total = productMap.get(productId) || 0;
        productMap.set(productId, total + detail.Total);
      });
    });

    return Array.from(productMap).map(([product, total]) => ({
      product,
      total
    }));
  };

  // Tambahkan fungsi-fungsi statistik baru
  const calculateTopDealers = (limit = topN) => {
    return calculateDealerTotals()
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  };

  const calculateTopItems = (groupByKey, limit = topN) => {
    const itemMap = new Map();

    transactionData.forEach(transaction => {
      transaction.Details.forEach(detail => {
        const keyValue = detail[groupByKey];
        if (Array.isArray(keyValue)) {
          keyValue.forEach(val => {
            const total = itemMap.get(val) || 0;
            itemMap.set(val, total + detail.Total);
          });
        } else {
          const total = itemMap.get(keyValue) || 0;
          itemMap.set(keyValue, total + detail.Total);
        }
      });
    });

    return Array.from(itemMap)
      .map(([name, total]) => ({ name: name || 'Unknown', total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  };

  // Update summary stats
  const summaryStats = {
    totalTransactions: transactionData.length,
    totalAmount: transactionData.reduce((acc, curr) => acc + curr.TotalAmount, 0),
    averageTransaction: transactionData.length > 0
      ? transactionData.reduce((acc, curr) => acc + curr.TotalAmount, 0) / transactionData.length
      : 0,
    topDealers: calculateTopDealers(),
    topCategories: calculateTopItems('Categories'),
    topProducts: calculateTopItems('Product'),
    topItemCodes: calculateTopItems('ItemCode'),
    topPartNumbers: calculateTopItems('PartNumber')
  };

  // Komponen reusable untuk chart top 5
  const Top5Chart = ({ title, data, color }) => (
    <Card title={title}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={axisFormatter} />
            <Tooltip formatter={renderTooltip} />
            <Bar dataKey="total" fill={color} name="Total Penjualan" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  const TopNChart = ({ title, data, color, limit = topN }) => (
    <Card title={`Top ${limit} ${title}`}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, limit)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={axisFormatter} />
            <Tooltip formatter={renderTooltip} />
            <Bar dataKey="total" fill={color} name="Total Penjualan" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  // 4. Format untuk tooltip currency
  const renderTooltip = (value) => formatRupiah(value);
  const axisFormatter = (value) => formatRupiah(value).replace('Rp', '');

  if (loadingAccess) return <div>Loading Access...</div>;
  if (!hasMenuAccess) return null;

  return (
    <div className="container mx-auto p-4 ml-[220px]">
      {/* Filter Section */}
      <Card title="Transaction Report">
        <form onSubmit={handleSubmit(handleFilter)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setShowProductPopup(!showProductPopup)}
                className="w-full p-2 border rounded text-left bg-white"
              >
                🛒 Filter Produk (Kategori → ItemCode)
              </button>

              {showProductPopup && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded shadow-md p-4 space-y-2">
                  {[
                    { name: 'ProductCategoryId', label: 'Kategori Produk', optionKey: 'categories' },
                    { name: 'ProductId', label: 'Produk', optionKey: 'products' },
                    { name: 'PartNumberId', label: 'Part Number', optionKey: 'partNumbers' },
                    { name: 'ItemCodeId', label: 'Item Code', optionKey: 'itemCodes' }
                  ].map(field => (
                    <Controller
                      key={field.name}
                      name={field.name}
                      control={control}
                      render={({ field: controllerField }) => (
                        <select {...controllerField} className="w-full p-2 border rounded">
                          <option value="">Semua {field.label}</option>
                          {options[field.optionKey]?.map(opt => (
                            <option key={opt.Id} value={opt.Id}>
                              {opt.Name || opt.ItemCode || opt.PartNumber}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  ))}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowProductPopup(false)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>


          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setShowDatePopup(!showDatePopup)}
              className="w-full p-2 border rounded text-left bg-white"
            >
              📅 {timeRangeOptions.find(opt => opt.value === timeRange)?.label || 'Pilih Waktu'}
            </button>

            {showDatePopup && (
              <div className="absolute z-50 mt-2 w-full bg-white border rounded shadow-md p-4 space-y-2">
                {timeRangeOptions.map(opt => (
                  <div key={opt.value}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Controller
                        name="timeRange"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="radio"
                            {...field}
                            checked={field.value === opt.value}
                            value={opt.value}
                            onChange={(e) => {
                              field.onChange(e);
                              if (opt.value !== 'custom') setShowDatePopup(false);
                            }}
                          />
                        )}
                      />
                      {opt.label}
                    </label>
                  </div>
                ))}

                {/* Show date inputs only if "custom" selected */}
                {timeRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field }) => (
                        <input type="date" {...field} className="p-2 border rounded w-full" />
                      )}
                    />
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field }) => (
                        <input type="date" {...field} className="p-2 border rounded w-full" />
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDatePopup(false)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Jumlah Top Item:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={topN}
              onChange={(e) => {
                const value = Math.min(50, Math.max(1, parseInt(e.target.value) || 1));
                setTopN(value);
              }}
              className="w-20 p-2 border rounded"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Apply Filters'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <h4 className="text-gray-500">Total Transaksi</h4>
          <p className="text-2xl font-bold">{summaryStats.totalTransactions}</p>
        </Card>
        <Card>
          <h4 className="text-gray-500">Total Nilai Transaksi</h4>
          <p className="text-2xl font-bold">{formatRupiah(summaryStats.totalAmount)}</p>
        </Card>
        <Card>
          <h4 className="text-gray-500">Rata-rata Transaksi</h4>
          <p className="text-2xl font-bold">{formatRupiah(summaryStats.averageTransaction)}</p>
        </Card>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dealer Performance */}
        <Card title="Performa Dealer">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calculateDealerTotals()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dealerName" />
                <YAxis tickFormatter={axisFormatter} />
                <Tooltip formatter={renderTooltip} />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total Penjualan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Product Sales */}
        <Card title="Penjualan Produk">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={calculateProductTotals().sort((a, b) => b.total - a.total)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={axisFormatter} />
                <YAxis type="category" dataKey="product" />
                <Tooltip formatter={renderTooltip} />
                <Legend />
                <Bar dataKey="total" fill="#82ca9d" name="Total Penjualan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <Card title="Status Distribution">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Dealer</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactionData.map((row) => (
              <tr key={row.Id} className="border-t">
                <td className="p-3">{dayjs(row.CreatedAt).format('DD MMM YYYY HH:mm')}</td>
                <td className="p-3">{row.Dealer?.Name}</td>
                <td className="p-3">
                  <div>{row.User?.Name}</div>
                  <div className="text-sm text-gray-500">{row.User?.Email}</div>
                </td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: `${statusOptions.find(opt => opt.value === row.Status)?.color}20`,
                      color: statusOptions.find(opt => opt.value === row.Status)?.color
                    }}
                  >
                    {row.Status.split('_').join(' ')}
                  </span>
                </td>
                <td className="p-3 text-right">{formatRupiah(row.TotalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatisticReport;