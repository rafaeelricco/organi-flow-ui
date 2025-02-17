import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { CustomNodeElementProps } from 'react-d3-tree';

export const NodeLabel: React.FC<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode
}) => {
  return (
    <React.Fragment>
      <foreignObject
        width={224}
        height={100}
        x={-112}
        y={-50}
      >
        <Card className="bg-white shadow-lg" onClick={toggleNode}>
          <CardContent className="p-3 py-2">
            <div className="flex flex-col gap-1">
              <div className="text-md font-semibold">{nodeDatum.name}</div>
              {nodeDatum.attributes && (
                <>
                  <div className="text-xs text-gray-500">
                    {String(nodeDatum.attributes.title)}
                  </div>
                  {String(nodeDatum.attributes.manager) !== 'None' && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      Reports to: {String(nodeDatum.attributes.manager)}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </foreignObject>
    </React.Fragment>
  );
}; 