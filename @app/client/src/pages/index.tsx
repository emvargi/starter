import {DownOutlined} from "@ant-design/icons";
import {ApolloError} from "@apollo/client";
import {SharedLayout,TaskForm,TaskList} from "@app/components";
import {
  Status,
  useAddFakeTasksMutation, useAddTaskMutation,
  useDeleteAllTasksMutation,
  useTasksListQuery,
  useUpdateTaskStatusMutation
} from "@app/graphql/index";
import {extractError} from "@app/lib";
import {Alert,Button, Col, Dropdown, Menu, Modal, Row} from "antd";
import {NextPage} from "next";
import * as React from "react";

import styles from './index.module.css';

const Home: NextPage = () => {

  const query = useTasksListQuery();  // todo, new to GraphQL & React, what's proper strategy for combining queries when parts used by child components?

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [currentError, _setCurrentError] = React.useState<Error | ApolloError | null>(null);
  const createSetErrorHandler = (context: string) => {
    return (error: any) => { if(error) {console.error(context, error);} _setCurrentError(error)};
  }

  // 'activate' -- change task status
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const setChangeStatusError = createSetErrorHandler('Change Task Status')
  const setStatus = React.useCallback(
    async (id: string, status: Status) => {
      try {
        setChangeStatusError(null);
        await updateTaskStatus({variables: {id: id, status: status}});
      } catch (e) {
        setChangeStatusError(e);
      }
    },
    [updateTaskStatus, setChangeStatusError]
  );

  // for prototyping only -- delete all tasks
  const tasks = query.data?.tasks?.nodes || [];
  const [deleteAllTasks] = useDeleteAllTasksMutation();
  const deleteAllTasksError = createSetErrorHandler('Delete All Tasks')
  const runDeleteAllTasks = React.useCallback(
    async () => {
      try {
        deleteAllTasksError(null);
        await deleteAllTasks()
        await query.refetch();  // TODO ditto useMutation refetch
      } catch (e) {
        deleteAllTasksError(e);
      }
    },
    [deleteAllTasks, deleteAllTasksError, query]
  );

  // for prototyping only -- add a batch of tasks
  const [addFakeTasks] = useAddFakeTasksMutation();
  const addFakeTasksError = createSetErrorHandler('Add Fake Tasks')
  const runAddFakeTasks = React.useCallback(
    async () => {
      try {
        addFakeTasksError(null);
        await addFakeTasks()
        await query.refetch();  // TODO ditto useMutation refetch
      } catch (e) {
        addFakeTasksError(e);
      }
    },
    [addFakeTasks, addFakeTasksError, query]
  );

  const [addTask] = useAddTaskMutation();
  const addBadTaskError = createSetErrorHandler('Add Bad Task')
  const runAddBadTask = React.useCallback(
    async () => {
      try {
        addBadTaskError(null);
        await addTask({variables: {title: 'Whoops', status: 'nope' as Status, description: 'Success is stumbling from failure to failure with no loss of enthusiasm.'}})
      } catch (e) {
        addBadTaskError(e);
      }
    },
    [addTask, addBadTaskError]
  );

  const devMenu = (
    <Menu>
      <Menu.Item onClick={runAddFakeTasks}>
        Create 10 Tasks
      </Menu.Item>
      <Menu.Item onClick={runAddBadTask}>
        Create a 'bad' task (errors)
      </Menu.Item>
      <Menu.Item danger onClick={runDeleteAllTasks}>
        Delete all tasks
      </Menu.Item>
    </Menu>
  )

  // todo refactor some of this out, ran out of time & hit issues with styles (was trying module css but next doesn't autogen due to @zeit/next-css?
  return (
    <SharedLayout title="Task Tracker" query={query} noPad={true}>
      <Row>
        <Col span={2}></Col>
        <Col span={20}>
          {currentError ?
            <Alert message={extractError(currentError).message} type="error" closable onClose={() => _setCurrentError(null)}/>
            : undefined
          }
        </Col>
        <Col span={2}></Col>
      </Row>

      <Row className={styles.subLayout}>
        <Col span={2}></Col>
        <Col span={20}>
          <div className='flex header'>
            <div className='flex flex-left'>
              <Dropdown overlay={devMenu}>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>Dev/Test Options <DownOutlined/></a>
              </Dropdown>
            </div>
            <div className='flex flex-right'>
              <Button type="primary" onClick={() => setIsModalVisible(true)}>Create Task</Button>
            </div>
          </div>
          <TaskList tasks={tasks} handleStatusChange={setStatus}></TaskList>
        </Col>
        <Col span={2}></Col>
      </Row>

      <Modal
        title="Add Task" visible={isModalVisible} onOk={() => setIsModalVisible(false)} onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="done" onClick={() => { _setCurrentError(null); setIsModalVisible(false)}}>Done</Button>,
        ]}
      >
        <div>
          <TaskForm error={currentError} setError={createSetErrorHandler('Create Task Form')} />
        </div>
      </Modal>

    </SharedLayout>
  );
};

export default Home;





