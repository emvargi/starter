import {DownOutlined} from "@ant-design/icons";
import {Status} from "@app/graphql/index";
import {Dropdown, Menu, Table} from "antd";
import {SortOrder} from "antd/lib/table/interface";
import * as React from "react";

import {getStatusOptions, StatusDisplayName} from "./statusUtils";

export type StatusChangeHandler = (id: string, status: Status) => void

export type TaskListTableProps = {
  tasks: any;
  changeStatus: StatusChangeHandler;
}

export function TaskListTable({ tasks, changeStatus }: TaskListTableProps) {
  return (
    <Table
      dataSource={tasks}
      columns={columns(changeStatus)}
      rowKey="id"
      pagination={false}
      // pagination={{ disabled: true, pageSize: 25 }}
      scroll={{ y: 600 }}  //todo scroll vs css height vs limits of server-side-rendering -- needs work for dynamic sizing...
    ></Table>
  );
}

const menu = (row: any, clickHandler: StatusChangeHandler) => (
  <Menu>
    {
      getStatusOptions().map((opt) =>
        <Menu.Item
          key={ opt.id }
          onClick={ () => clickHandler(row.id, opt.id) }
          disabled={ opt.id === row.status ? true : undefined }
        >
          { opt.label }
        </Menu.Item>
      )
    }
  </Menu>
);

const sorter = (field: string) => ({
  sorter: (a: any, b: any) => (a[field] || '').localeCompare((b[field] || '')),
  sortDirections: ['ascend' as SortOrder, 'descend' as SortOrder],
})

const getStatusColor = (status: string) => status==='DONE' ? 'rgba(54,167,56,0.95)' : (status==='IN_PROGRESS' ?  '#e9af04' : 'rgba(213,63,30,0.8)')

const columns = (changeStatus: StatusChangeHandler) => [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    width: '30%',
    resizable: true,
    ...sorter('title'),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '20%',
    resizable: true,
    ...sorter('status'),
    render: function renderStatus(text: string, row: any) {
      return <Dropdown overlay={menu(row, changeStatus)}>
        <span style={{'color': getStatusColor(text)}}>{StatusDisplayName.get(text)} <DownOutlined /></span>
      </Dropdown>;
    }
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    resizable: true,
    ...sorter('description'),
  },
];
