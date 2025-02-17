import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'
import * as React from 'react'
import { CustomNodeElementProps } from 'react-d3-tree'

export const NodeLabel: React.FC<CustomNodeElementProps> = ({
   nodeDatum,
   toggleNode
}) => {
   const holding = useDisclosure()

   return (
      <React.Fragment>
         <div
            className="slot relative z-10"
            data-swapy-slot={`node-id-${nodeDatum.attributes?.id}-slot-manager-id-${nodeDatum.attributes?.manager_id}`}
         >
            <div
               data-swapy-item={`node-id-${nodeDatum.attributes?.id}-item-manager-id-${nodeDatum.attributes?.manager_id}`}
               className="relative"
            >
               <Card
                  className={cn(
                     'group cursor-grab bg-white shadow-lg active:cursor-grabbing',
                     holding.isOpen && 'border border-gray-500'
                  )}
                  data-swapy-handle
                  onMouseDown={() => holding.open()}
                  onMouseUp={() => holding.close()}
                  onMouseLeave={() => holding.close()}
                  onClick={toggleNode}
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
                              {nodeDatum.name}
                           </div>
                           {nodeDatum.attributes && (
                              <React.Fragment>
                                 <div className="select-none text-xs text-gray-500">
                                    {String(nodeDatum.attributes.title)}
                                 </div>
                                 {String(nodeDatum.attributes.manager) !==
                                    'None' && (
                                    <div className="mt-1 select-none text-[10px] text-gray-400">
                                       Reports to:{' '}
                                       {String(nodeDatum.attributes.manager)}
                                    </div>
                                 )}
                              </React.Fragment>
                           )}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </React.Fragment>
   )
}
