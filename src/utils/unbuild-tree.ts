import { EmployeeEntity } from '@/types/employee'

/** 
 *  @title Tree to Array Converter
 *  @notice Converts a hierarchical tree structure into a flat array of employee entities
 *  @param tree The hierarchical tree structure to be converted
 *  @return Array of employee entities with manager relationships
 */
export function unBuildTree(tree: TreeNode): EmployeeEntity[] {
   /** @dev Initialize array to store flattened employee data */
   const employees: EmployeeEntity[] = []

   /** @notice Recursive function to process each node in the tree
    *  @dev Traverses the tree and adds each node to the employees array
    *  @param node Current tree node being processed
    *  @param managerId ID of the current node's manager
    */
   function processNode(node: TreeNode, managerId: number | null) {
      /** @dev Create employee entity from current node data */
      employees.push({
         id: node.attributes.id,
         name: node.name,
         title: node.attributes.title,
         manager_id: managerId
      })

      /** @dev Recursively process all child nodes with current node as manager */
      node.children?.forEach((child) => {
         processNode(child, node.attributes.id)
      })
   }

   /** @dev Start processing from root node with null manager */
   processNode(tree, null)

   return employees
}
