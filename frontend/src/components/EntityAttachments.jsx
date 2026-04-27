import React, { useState, useEffect } from 'react';
import { Upload, Button, Tag, Space, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/axios';

export default function EntityAttachments({ entityType, entityId }) {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!entityId) return;
    try {
      const res = await api.get(`/${entityType}/${entityId}/attachments`);
      setAttachments(res.data.data || []);
    } catch {}
  };

  useEffect(() => { load(); }, [entityType, entityId]);

  const handleUpload = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(`/${entityType}/${entityId}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Uploaded'); load();
    } catch (err) { message.error(err.response?.data?.error || 'Upload failed'); }
    setUploading(false);
    return false;
  };

  const handleDelete = async (aid) => {
    try {
      await api.delete(`/${entityType}/${entityId}/attachments/${aid}`);
      message.success('Deleted'); load();
    } catch { message.error('Delete failed'); }
  };

  if (!entityId) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ marginBottom: 8 }}>
        {attachments.map(a => (
          <Tag key={a.id} closable onClose={(e) => { e.preventDefault(); handleDelete(a.id); }} style={{ marginBottom: 4 }}>
            {a.file_name} ({(a.file_size / 1024).toFixed(1)} KB)
          </Tag>
        ))}
        {attachments.length === 0 && <span style={{ color: '#999', fontSize: 12 }}>No attachments</span>}
      </div>
      <Upload beforeUpload={handleUpload} showUploadList={false} multiple={false}>
        <Button icon={<UploadOutlined />} size="small" loading={uploading}>Attach File</Button>
      </Upload>
    </div>
  );
}
