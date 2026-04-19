export enum DependencyType {
  FinishToStart = 'FS',
  StartToStart = 'SS',
  FinishToFinish = 'FF',
  StartToFinish = 'SF',
}

export interface GanttDependency {
  fromId: string;
  toId: string;
  type: DependencyType;
  color?: string;
  cssClass?: string;
}
