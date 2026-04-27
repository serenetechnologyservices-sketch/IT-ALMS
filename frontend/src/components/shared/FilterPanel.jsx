import React from 'react';
import { Form, Button, Row, Col, Select, Input } from 'antd';

export default function FilterPanel({ fields = [], onFilter }) {
  const [form] = Form.useForm();

  const handleApply = () => {
    const values = form.getFieldsValue();
    const result = {};
    fields.forEach((f) => {
      if (values[f.name] !== undefined && values[f.name] !== null && values[f.name] !== '') {
        result[f.name] = values[f.name];
      }
    });
    onFilter && onFilter(result);
  };

  return (
    <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
      <Row gutter={[8, 8]} align="middle" wrap>
        {fields.map((f) => (
          <Col key={f.name}>
            {f.type === 'select' && (
              <Form.Item name={f.name} label={f.label} style={{ marginBottom: 0 }}>
                <Select allowClear placeholder={`All ${f.label}`} style={{ minWidth: 140 }} options={f.options || []} />
              </Form.Item>
            )}
            {f.type === 'text' && (
              <Form.Item name={f.name} label={f.label} style={{ marginBottom: 0 }}>
                <Input placeholder={f.label} style={{ width: 140 }} />
              </Form.Item>
            )}
          </Col>
        ))}
        <Col><Button type="primary" onClick={handleApply}>Apply</Button></Col>
        <Col><Button onClick={() => { form.resetFields(); onFilter && onFilter({}); }}>Reset</Button></Col>
      </Row>
    </Form>
  );
}
