'use client'

import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/lib/utils'
import { EmployeeEntity } from '@/types/employee'
import { GripVertical } from 'lucide-react'

export const EmployeeNode: React.FC<EmployeeNodeProps> = ({ employee }) => {
   const holding = useDisclosure()

   const hasSubordinates =
      employee.subordinates && employee.subordinates.length > 0
   const childWidth = 200
   const childSpacing = 80

   const totalChildrenWidth = hasSubordinates
      ? (employee.subordinates?.length || 0) * childWidth +
        ((employee.subordinates?.length || 0) - 1) * childSpacing
      : 0

   return (
      <div className="relative flex h-fit flex-col items-center">
         <div
            className="slot relative z-10"
            data-swapy-slot={`emp-${employee.id}-slot`}
         >
            <div
               data-swapy-item={`emp-${employee.id}-item`}
               className="relative"
            >
               <Card
                  className={cn(
                     'group w-56 bg-white transition-all hover:shadow-lg',
                     holding.isOpen && 'border border-gray-500',
                     'cursor-grab active:cursor-grabbing'
                  )}
                  data-swapy-handle
                  onMouseDown={() => holding.open()}
                  onMouseUp={() => holding.close()}
                  onMouseLeave={() => holding.close()}
               >
                  <CardContent className="p-3 py-2">
                     <div className="flex items-center gap-2">
                        <div className="cursor-grab text-gray-400 active:cursor-grabbing">
                           <GripVertical
                              size={16}
                              className="select-none transition-all duration-300 hover:scale-110"
                           />
                        </div>
                        <Separator orientation="vertical" className="h-14" />
                        <div className="ml-1.5 flex-1">
                           <div className="text-md select-none font-semibold">
                              {employee.name}
                           </div>
                           <div className="select-none text-xs text-gray-500">
                              {employee.title}
                           </div>
                           {employee.manager && (
                              <div className="mt-1 select-none text-[10px] text-gray-400">
                                 Reports to: {employee.manager.name}
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
                           <EmployeeNode employee={subordinate} />
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
