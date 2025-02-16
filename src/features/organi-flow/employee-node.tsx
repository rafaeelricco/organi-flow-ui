'use client'

import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EmployeeEntity } from '@/types/employee';
import { GripVertical } from 'lucide-react';

interface EmployeeNodeProps {
  employee: EmployeeEntity;
}

export const EmployeeNode: React.FC<EmployeeNodeProps> = ({ employee }) => {
  const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;
  const childWidth = 250;
  const childSpacing = 20;
  
  const totalChildrenWidth = hasSubordinates
    ? (employee.subordinates?.length || 0) * childWidth + 
      ((employee.subordinates?.length || 0) - 1) * childSpacing
    : 0;

  return (
    <div className="flex flex-col items-center relative h-fit">
      <div 
        className="slot relative z-10"
        data-swapy-slot={`slot-${employee.id}`}
      >
        <div
          data-swapy-item={`slot-${employee.id}`}
          className="relative"
        >
          <Card className="w-56 hover:shadow-lg transition-all bg-white">
            <CardContent className="p-3 py-2">
              <div className="flex items-center gap-2">
                <div className="text-gray-400 cursor-grab active:cursor-grabbing" data-swapy-handle>
                  <GripVertical size={16} />
                </div>
                <Separator orientation='vertical' className='h-14' />
                <div className="flex-1 ml-1.5">
                  <div className="text-md font-semibold">{employee.name}</div>
                  <div className="text-xs text-gray-500">{employee.title}</div>
                  {employee.manager && (
                    <div className="text-[10px] text-gray-400 mt-1">
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
          className="flex flex-col items-center absolute top-[100%]"
          style={{ 
            width: `${totalChildrenWidth}px`,
            minWidth: '100%',
            zIndex: 1
          }}
        >
          <div className="h-6 border-l border-gray-200 absolute top-0 left-1/2 -translate-x-1/2"></div>
          <div 
            className="border-t border-gray-200 absolute top-6"
            style={{ 
              left: `${childWidth / 2}px`,
              width: totalChildrenWidth > childWidth ? `${totalChildrenWidth - childWidth}px` : '0px'
            }}
          ></div>
          <div 
            className="flex justify-start absolute top-6"
            style={{  gap: `${childSpacing}px`, width: `${totalChildrenWidth}px` }}
          >
            {employee.subordinates?.map((subordinate) => {
              return (
                <div 
                  key={subordinate.id} 
                  className="flex flex-col items-center relative"
                  style={{ minWidth: `${childWidth}px` }}
                >
                  <div className="h-6 border-l border-gray-200 absolute top-0 left-1/2 -translate-x-1/2"></div>
                  <div className="pt-8">
                    <EmployeeNode employee={subordinate} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};