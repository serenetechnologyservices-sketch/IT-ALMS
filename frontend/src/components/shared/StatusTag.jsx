import React from 'react';
import { Tag } from 'antd';

const COLOR_MAP = {
  available: 'green', allocated: 'blue', repair: 'orange', scrap: 'red',
  active: 'green', inactive: 'red', returned: 'default', transferred: 'cyan',
  open: 'blue', assigned: 'cyan', in_progress: 'orange', waiting: 'purple', resolved: 'green', closed: 'default',
  pending_manager: 'orange', pending_admin: 'blue', approved: 'green', rejected: 'red',
  low: 'default', medium: 'blue', high: 'orange', critical: 'red',
  warranty: 'blue', amc: 'purple',
};

export default function StatusTag({ value }) {
  if (!value) return '-';
  return <Tag color={COLOR_MAP[value] || 'default'}>{value.replace(/_/g, ' ').toUpperCase()}</Tag>;
}
