// components/PieChart.js
'use client';
import React from 'react';
import { Pie } from '@ant-design/plots';

const PieChart = ({ data }) => {
  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    label: {
      type: 'inner',
      content: '{percentage}',
    },
    legend: {
      position: 'bottom',
    },
  };

  return <Pie {...config} />;
};

export default PieChart;
