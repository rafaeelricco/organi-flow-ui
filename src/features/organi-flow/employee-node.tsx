'use client'

import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { EmployeeEntity } from '@/types/employee';
import { GripVertical } from 'lucide-react';

export const EmployeeNode: React.FC<{ employee: EmployeeEntity }> = ({ employee }) => {
    const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;
    const childWidth = 300; // Largura base para cada filho
    const childSpacing = 20; // Espaçamento entre filhos
    
    // Calcula a largura total necessária para os subordinados
    const totalChildrenWidth = hasSubordinates
      ? (employee.subordinates?.length || 0) * (childWidth + childSpacing)
      : 0;

    return (
      <div className="flex flex-col items-center">
        <div 
          className="slot relative"
          data-swapy-slot={`slot-${employee.id}`}
        >
          <div
            data-swapy-item={`slot-${employee.id}`}
            className="relative"
          >
            <Card className="w-64 mb-8 hover:shadow-lg transition-all">
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
          <div 
            className="flex flex-col items-center"
            style={{ 
              width: `${totalChildrenWidth}px`,
              minWidth: '100%'
            }}
          >
            <div className="h-8 border-l-2 border-gray-300"></div>
            <div className="w-full border-t-2 border-gray-300"></div>
            <div 
              className="flex justify-around w-full px-8"
              style={{ 
                gap: `${childSpacing}px`,
                marginTop: '-2px'
              }}
            >
              {employee.subordinates?.map((subordinate) => (
                <div 
                  key={subordinate.id} 
                  className="flex flex-col items-center"
                  style={{ minWidth: `${childWidth}px` }}
                >
                  <div className="h-8 border-l-2 border-gray-300"></div>
                  <EmployeeNode employee={subordinate} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };