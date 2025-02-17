import { EmployeeEntity } from '@/types/employee'

export function unBuildTree(tree: TreeNode): EmployeeEntity[] {
   const employees: EmployeeEntity[] = []

   function processNode(node: TreeNode, managerId: number | null) {
      employees.push({
         id: node.attributes.id,
         name: node.name,
         title: node.attributes.title,
         manager_id: managerId
      })
      node.children?.forEach((child) => {
         processNode(child, node.attributes.id)
      })
   }
   processNode(tree, null)

   return employees
}
