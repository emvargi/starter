import {Status} from "@app/graphql";

// fixMe: this file is not in lib project b/c some config error eventually causes a throw of a webpack/babel/esxxx error:
// "You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file."

export interface StatusOption {
  id: Status,
  label: string,
}

// todo: map is used as src to guarantee order in UI
// improvement: address order here while still including labels missing in UI (or define & send labels from b/e)
export const StatusDisplayName = new Map<string, string>([
  [Status.ToDo, 'To Do'],
  [Status.InProgress, 'In Progress'],
  [Status.Done, 'Done'],
]);

export const statusToDisplayName = (status: Status): string => StatusDisplayName.get(status) || status;

export const getStatusOptions = (): StatusOption[] => {
  return Array.from(StatusDisplayName.keys()).map(
    (s) => {
      return {id: s as Status, label: statusToDisplayName(s as Status)}
    }
  );
}

