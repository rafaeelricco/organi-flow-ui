import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import * as React from 'react';
import { CustomNodeElementProps } from 'react-d3-tree';

export const NodeLabel: React.FC<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode
}) => {
  const holding = useDisclosure();

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
                "bg-white shadow-lg group cursor-grab active:cursor-grabbing",
                holding.isOpen && "border border-gray-500"
              )}
              data-swapy-handle
              onMouseDown={() => holding.open()}
              onMouseUp={() => holding.close()}
              onMouseLeave={() => holding.close()}
              onClick={toggleNode}
            >
              <CardContent className="p-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} className="select-none hover:scale-110 transition-all duration-300" />
                  </div>
                  <Separator orientation="vertical" className="h-14" />
                  <div className="flex-1 ml-1.5">
                    <div className="text-md font-semibold select-none">{nodeDatum.name}</div>
                    {nodeDatum.attributes && (
                      <React.Fragment>
                        <div className="text-xs text-gray-500 select-none">
                          {String(nodeDatum.attributes.title)}
                        </div>
                        {String(nodeDatum.attributes.manager) !== 'None' && (
                          <div className="text-[10px] text-gray-400 mt-1 select-none">
                            Reports to: {String(nodeDatum.attributes.manager)}
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
  );
}; 