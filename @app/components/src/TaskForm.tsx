import {ApolloError} from "@apollo/client";
import {
  TasksListDocument,
  TasksListQuery,
  useAddTaskMutation,
} from "@app/graphql/index";
import {extractError, formItemLayout, getCodeFromError, tailFormItemLayout} from "@app/lib";
import {Alert, Button, Form, Input, Select} from 'antd';
import {useForm} from "antd/lib/form/Form";
import TextArea from "antd/lib/input/TextArea";
import {Store} from "rc-field-form/lib/interface";
import * as React from "react";

import {getStatusOptions} from "./statusUtils";

const { Option } = Select;

export type TaskFormProps = {
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

export function TaskForm({ error, setError }: TaskFormProps) {
  const [form] = useForm();
  const [addTask] = useAddTaskMutation();
  const handleSubmit = React.useCallback(
    async (values: Store) => {
      try {
        setError(null);
        await addTask({
          variables: {title: values.title, status: values.status, description: values.description},
          update(cache, {data}) {
            const newTask = data?.createTask?.task;
            const existingTasks = cache.readQuery<TasksListQuery>({
              query: TasksListDocument,
            });
            if (newTask && existingTasks) {
              cache.writeQuery({
                query: TasksListDocument,
                data: {...existingTasks, tasks: {...existingTasks.tasks, nodes: [...existingTasks?.tasks?.nodes || [], newTask]}},
              });
            }
          }
        });
        form.resetFields();
      } catch (e) {
        setError(e);
      }
    },
    [addTask, form, setError]
  );
  const code = getCodeFromError(error);

  return (<Form {...formItemLayout} form={form} onFinish={handleSubmit}>
      <Form.Item label="Title" name="title"
        rules={[{required: true, message: "Please enter a title"}]}
      >
        <Input data-cy="addtask-input-title" />
      </Form.Item>

      <Form.Item label="Description" name="description"
        rules={[{required: true, message: "Please enter a description"}]}
      >
        <TextArea data-cy="addtask-input-description" />
      </Form.Item>

      <Form.Item label="Status" name="status"
        rules={[{required: true, message: "Please choose a status"}]}
      >
        <Select data-cy="addtask-input-description">
          {getStatusOptions().map((opt) => <Option key={opt.id} value={opt.id}>{opt.label}</Option>)}
        </Select>
      </Form.Item>

      {error ? (
        <Form.Item>
          <Alert type="error" message={`Error creating task, see console for details`}
            description={
              <span>
                {extractError(error).message}
                {code ? (
                  <span>{" "} (Error code: <code>ERR_{code}</code>)</span>
                ) : null}
              </span>
            }
          />
        </Form.Item>
      ) : null}
      <Form.Item {...tailFormItemLayout}>
        <Button type={'primary'} htmlType="submit" data-cy="addtask-button-submit">
          Add Task
        </Button>
      </Form.Item>
    </Form>
  );
}
