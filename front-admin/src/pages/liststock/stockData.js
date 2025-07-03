const stockData = [
    {
      id: 1,
      category: "Hydraulic Hoses",
      name: "High Pressure Hose",
      partNumber: "HP-100",
      stock: 50,
      itemCodes: [
        { id: 101, name: "HP-100-001", stock: 30 },
        { id: 102, name: "HP-100-002", stock: 20 },
      ],
    },
    {
      id: 2,
      category: "Hydraulic Hoses",
      name: "Low Pressure Hose",
      partNumber: "LP-200",
      stock: 70,
      itemCodes: [
        { id: 103, name: "LP-200-001", stock: 40 },
        { id: 104, name: "LP-200-002", stock: 30 },
      ],
    },
    {
      id: 3,
      category: "Industrial Pipes",
      name: "Steel Pipe",
      partNumber: "SP-300",
      stock: 80,
      itemCodes: [
        { id: 105, name: "SP-300-001", stock: 50 },
        { id: 106, name: "SP-300-002", stock: 30 },
      ],
    },
    {
      id: 4,
      category: "Industrial Pipes",
      name: "PVC Pipe",
      partNumber: "PVC-400",
      stock: 60,
      itemCodes: [
        { id: 107, name: "PVC-400-001", stock: 35 },
        { id: 108, name: "PVC-400-002", stock: 25 },
      ],
    },
  ];
  
  export default stockData;
  