'use client'

import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/lib/utils'
import { EmployeeEntity } from '@/types/employee'
import { GripVertical } from 'lucide-react'

export const EmployeeNodeSkeleton: React.FC<EmployeeNodeProps> = ({
   employee
}) => {
   const holding = useDisclosure()

   const hasSubordinates =
      employee.subordinates && employee.subordinates.length > 0
   const childWidth = 200
   const childSpacing = 300

   const totalChildrenWidth = hasSubordinates
      ? (employee.subordinates?.length || 0) * childWidth +
        ((employee.subordinates?.length || 0) - 1) * childSpacing
      : 0

   return (
      <div className="relative flex h-fit flex-col items-center">
         <div
            className="slot relative z-10"
            data-swapy-slot={`slot-${employee.id}`}
         >
            <div data-swapy-item={`slot-${employee.id}`} className="relative">
               <Card
                  className={cn(
                     'group w-56 bg-white transition-all hover:shadow-lg',
                     holding.isOpen && 'border border-gray-500'
                  )}
               >
                  <CardContent className="p-3 py-2">
                     <div className="flex items-center gap-2">
                        <div
                           className="cursor-grab text-gray-400 active:cursor-grabbing"
                           data-swapy-handle
                           onMouseDown={() => holding.open()}
                           onMouseUp={() => holding.close()}
                           onMouseLeave={() => holding.close()}
                        >
                           <GripVertical
                              size={16}
                              className="select-none transition-all duration-300 hover:scale-110 hover:text-gray-400 active:text-gray-600"
                           />
                        </div>
                        <Separator orientation="vertical" className="h-14" />
                        <div className="ml-1.5 flex-1 space-y-1">
                           <Skeleton className="h-6 w-[120px] bg-neutral-200" />
                           <Skeleton className="h-4 w-[80px] bg-neutral-200" />
                           {employee.manager && (
                              <div className="mt-1 flex select-none items-center gap-1 text-[10px] text-gray-400">
                                 Reports to:{' '}
                                 <Skeleton className="h-3.5 w-[40px] bg-neutral-200" />
                              </div>
                           )}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
         {hasSubordinates && (
            <div
               className="absolute top-[100%] flex flex-col items-center"
               style={{
                  width: `${totalChildrenWidth}px`,
                  minWidth: '100%',
                  zIndex: 1
               }}
            >
               <div className="absolute left-1/2 top-0 h-12 -translate-x-1/2 border-l border-gray-200"></div>
               <div
                  className="absolute top-12 border-t border-gray-200"
                  style={{
                     left: `${childWidth / 2}px`,
                     width:
                        totalChildrenWidth > childWidth
                           ? `${totalChildrenWidth - childWidth}px`
                           : '0px'
                  }}
               ></div>
               <div
                  className="absolute top-12 flex justify-start"
                  style={{
                     gap: `${childSpacing}px`,
                     width: `${totalChildrenWidth}px`
                  }}
               >
                  {employee.subordinates?.map((subordinate) => (
                     <div
                        key={subordinate.id}
                        className="relative flex flex-col items-center"
                        style={{ minWidth: `${childWidth}px` }}
                     >
                        <div className="absolute left-1/2 top-0 h-12 -translate-x-1/2 border-l border-gray-200"></div>
                        <div className="pt-12">
                           <EmployeeNodeSkeleton employee={subordinate} />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   )
}

interface EmployeeNodeProps {
   employee: EmployeeEntity
}
