'use client'

import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { EmployeeEntity } from '@/types/employee';
import { GripVertical } from 'lucide-react';

export const EmployeeNode: React.FC<{ employee: EmployeeEntity }> = ({ employee }) => {
    const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;
    return (
      <div className="flex flex-col items-center">
        <div 
          className="slot"
          data-swapy-slot={`slot-${employee.id}`}
        >
          <div
            data-swapy-item={`slot-${employee.id}`}
            className="relative"
          >
            <Card className={`w-64 mb-4 hover:shadow-lg transition-all`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="text-gray-400 cursor-grab active:cursor-grabbing" data-swapy-handle>
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.title}</div>
                    {employee.manager && (
                      <div className="text-xs text-gray-400 mt-1">
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
          <div className="relative pt-4">
            <div className="absolute top-0 left-1/2 h-4 w-px bg-gray-300" />
            <div className="flex gap-8">
              {employee.subordinates?.map((subordinate) => (
                <div key={subordinate.id} className="relative">
                  <div className="absolute top-0 left-1/2 h-4 w-px bg-gray-300" />
                  <EmployeeNode employee={subordinate} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };