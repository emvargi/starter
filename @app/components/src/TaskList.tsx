import * as React from "react";

import {StatusChangeHandler, TaskListTable} from "./TaskListTable";

export type TaskListProps = {
  tasks: any;
  handleStatusChange: StatusChangeHandler
}

export function TaskList({tasks, handleStatusChange}: TaskListProps) {
  return (<TaskListTable tasks={tasks} changeStatus={handleStatusChange} />);
}


