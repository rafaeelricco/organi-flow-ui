'use client'

import * as React from 'react'

import { employeesMock } from '@/features/organi-flow/employee-mock'
import { EmployeeNodeSkeleton } from '@/features/organi-flow/employee-node-skeleton'
import { NodeLabel } from '@/features/organi-flow/node-label'
import { useElementSize } from '@/hooks/useElementSize'
import { fetcher } from '@/lib/fetcher'
import { unBuildTree } from '@/utils/unbuild-tree'
import { toast } from 'sonner'
import { createSwapy, Swapy } from 'swapy'

import Tree from 'react-d3-tree'
import useSWR, { mutate } from 'swr'

/** 
 *  @title Organization Chart Application Component
 *  @notice Main component that renders an interactive organizational chart with drag-and-drop functionality
 */
export const OrgChartApp: React.FC = () => {
   /** @dev Fetches employee data from the API using SWR for data management */
   const {
      data: apiData,
      isLoading
   } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/employees`, fetcher)

   /** @dev State to store the hierarchical tree structure of employees */
   const [tree, setTree] = React.useState<TreeNode | null>(null)

   /** @dev References for the container and Swapy instance */
   const containerRef = React.useRef<HTMLDivElement>(null)
   const swapyRef = React.useRef<Swapy | null>(null)

   /** @dev Updates tree state when API data is received */
   React.useEffect(() => {
      if (apiData) {
         setTree(apiData as unknown as TreeNode)
      }
   }, [apiData])

   /** @dev Custom hook to track container dimensions */
   const {
      ref: sizeRef,
      width: containerWidth,
      height: containerHeight
   } = useElementSize<HTMLDivElement>()

   /** @dev Combines container and size refs into a single ref callback */
   const setRefs = (element: HTMLDivElement | null) => {
      containerRef.current = element
      sizeRef.current = element
   }

   /** @dev Calculates the center position for the tree based on container dimensions */
   const centerPosition = React.useMemo(
      () => ({
         x: containerWidth / 2,
         y: containerHeight / 5
      }),
      [containerWidth, containerHeight]
   )

   /** @dev Initializes Swapy drag-and-drop functionality and handles employee position swapping
    *  @notice Sets up event handlers for drag-and-drop operations and updates employee manager relationships
    */
   React.useEffect(() => {
      if (containerRef.current) {
         let isEnabled = true

         swapyRef.current = createSwapy(containerRef.current, {
            animation: 'none',
            dragAxis: 'x',
            enabled: isEnabled
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
                  const loadingToast = toast.loading('Updating employees positions...');
                  isEnabled = false;

                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-employee-manager`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                        employee_id: findEmployeeInfos.id,
                        target_id: findNewManagerInfos.id
                     })
                  }).finally(() => toast.dismiss(loadingToast));

                  if (response.ok) {
                     toast.success('Positions swapped successfully!', { richColors: true });
                     isEnabled = true;
                  } else {
                     throw new Error('Update failed');
                  }
               } catch (error) {
                  toast.error('Failed to swap positions!', { richColors: true });
                  mutate(`${process.env.NEXT_PUBLIC_API_URL}/employees`);
               }
            }
         })
      }

      return () => {
         swapyRef.current?.destroy()
      }
   }, [apiData, tree])

   return (
      <div className="h-screen w-screen bg-white" ref={setRefs}>
         <div style={{ width: '100%', height: '100%' }}>
            {isLoading ? (
               <div className="flex h-full items-center justify-center">
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
