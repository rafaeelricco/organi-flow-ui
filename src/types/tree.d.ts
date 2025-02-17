declare global {
  interface TreeNode {
    name: string;
    attributes: {
      id: number;
      title: string;
      manager_id: number;
    };
    children?: TreeNode[];
  }
}

export { };
