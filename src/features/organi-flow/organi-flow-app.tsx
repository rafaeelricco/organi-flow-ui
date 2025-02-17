'use client'

import * as React from 'react'

import { EmployeeNodeSkeleton } from '@/features/organi-flow/employee-node-skeleton'
import { employeesMock } from '@/features/organi-flow/employees-mock'
import { NodeLabel } from '@/features/organi-flow/node-label'
import { useElementSize } from '@/hooks/useElementSize'
import { fetcher } from '@/lib/fetcher'
import { EmployeeEntity } from '@/types/employee'
import { toast } from 'sonner'
import { createSwapy, Swapy } from 'swapy'

import Tree from 'react-d3-tree'
import useSWR from 'swr'

export const OrgChartApp: React.FC = () => {
   const {
      data: apiData,
      isLoading,
      mutate
   } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/employees`, fetcher)

   const [tree, setTree] = React.useState<TreeNode | null>(null)

   const containerRef = React.useRef<HTMLDivElement>(null)
   const swapyRef = React.useRef<Swapy | null>(null)

   React.useEffect(() => {
      if (apiData) {
         setTree(apiData as unknown as TreeNode)
      }
   }, [apiData])

   const {
      ref: sizeRef,
      width: containerWidth,
      height: containerHeight
   } = useElementSize<HTMLDivElement>()

   const setRefs = (element: HTMLDivElement | null) => {
      containerRef.current = element
      sizeRef.current = element
   }

   const centerPosition = React.useMemo(
      () => ({
         x: containerWidth / 2,
         y: containerHeight / 5
      }),
      [containerWidth, containerHeight]
   )

   React.useEffect(() => {
      if (containerRef.current) {
         swapyRef.current = createSwapy(containerRef.current, {
            animation: 'none',
            dragAxis: 'both'
         })

         let fromId: number | undefined = undefined
         let toId: number | undefined = undefined

         swapyRef.current.onBeforeSwap((event) => {
            // This is for dynamically enabling and disabling swapping.
            // Return true to allow swapping, and return false to prevent swapping.
            return true
         })
         swapyRef.current.onSwap(async (event) => {
            fromId = parseInt(
               event.fromSlot.split('node-id-')[1].split('-slot-')[0]
            )
            toId = parseInt(
               event.toSlot.split('node-id-')[1].split('-slot-')[0]
            )
         })
         swapyRef.current.onSwapEnd(async (event) => {
            const unBuildedTree = unBuildTree(tree as TreeNode)

            if (!fromId || !toId) return

            const findEmployeeInfos = unBuildedTree.find(
               (employee) => employee.id === fromId
            )
            const findNewManagerInfos = unBuildedTree.find(
               (employee) => employee.id === toId
            )

            if (findEmployeeInfos && findNewManagerInfos) {
               try {
                  const response1 = await fetch(
                     `${process.env.NEXT_PUBLIC_API_URL}/update-employee-manager`,
                     {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                           id: findEmployeeInfos?.id,
                           new_manager_id: findNewManagerInfos?.manager_id
                        })
                     }
                  )

                  const response2 = await fetch(
                     `${process.env.NEXT_PUBLIC_API_URL}/update-employee-manager`,
                     {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                           id: findNewManagerInfos?.id,
                           new_manager_id: findEmployeeInfos?.manager_id
                        })
                     }
                  )

                  if (!response1.ok || !response2.ok)
                     throw new Error('Falha na atualização')

                  toast.success('Atualização bem-sucedida!')

                  mutate()
               } catch (error) {
                  toast.error('Erro na atualização!')
               }
            }
         })
      }

      return () => {
         swapyRef.current?.destroy()
      }
   }, [apiData, tree, mutate])

   return (
      <div className="h-screen w-screen bg-white" ref={setRefs}>
         <div style={{ width: '100%', height: '100%' }}>
            {isLoading ? (
               <div className="flex items-center justify-center h-full">
                  <EmployeeNodeSkeleton employee={employeesMock[0]} />
               </div>
            ) : (
               tree && (
                  <Tree
                     data={tree}
                     draggable
                     hasInteractiveNodes
                     orientation="vertical"
                     enableLegacyTransitions
                     translate={centerPosition}
                     nodeSize={{ x: 150, y: 150 }}
                     separation={{ siblings: 2, nonSiblings: 2.5 }}
                     renderCustomNodeElement={(props) => (
                        <foreignObject width="200" height="74" x="-100" y="-32">
                           <NodeLabel {...props} />
                        </foreignObject>
                     )}
                  />
               )
            )}
         </div>
      </div>
   )
}

function unBuildTree(tree: TreeNode): EmployeeEntity[] {
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
