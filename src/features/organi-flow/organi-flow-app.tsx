'use client'

import * as React from 'react';

import { EmployeeNode } from '@/features/organi-flow/employee-node';
import { useDisclosure } from '@/hooks/useDisclosure';
import { EmployeeEntity } from '@/types/employee';
import { toast } from 'sonner';
import { createSwapy, Swapy } from 'swapy';

const employeesData: EmployeeEntity[] = [
  { id: 1, name: "John Smith", title: "CEO", manager_id: null },
  { id: 2, name: "Sarah Johnson", title: "CTO", manager_id: 1 },
  { id: 3, name: "Michael Chen", title: "Engineering Director", manager_id: 2 },
  { id: 4, name: "Emily Davis", title: "Senior Developer", manager_id: 3 },
  { id: 5, name: "David Wilson", title: "Product Director", manager_id: 1 },
  { id: 6, name: "Lisa Brown", title: "HR Director", manager_id: 1 },
  { id: 7, name: "James Taylor", title: "Frontend Lead", manager_id: 3 },
  { id: 8, name: "Maria Garcia", title: "Backend Lead", manager_id: 3 },
  { id: 9, name: "Robert Kim", title: "DevOps Engineer", manager_id: 8 },
  { id: 10, name: "Amanda White", title: "UX Designer", manager_id: 7 },
  { id: 11, name: "Thomas Anderson", title: "Software Engineer", manager_id: 7 },
  { id: 12, name: "Jennifer Lee", title: "Product Manager", manager_id: 5 },
  { id: 13, name: "Carlos Rodriguez", title: "QA Lead", manager_id: 3 },
  { id: 14, name: "Sophie Martin", title: "HR Manager", manager_id: 6 },
  { id: 15, name: "Daniel Brown", title: "Software Engineer", manager_id: 8 },
];

const buildHierarchy = (employees: EmployeeEntity[]): EmployeeEntity[] => {
  const employeeMap = new Map<number, EmployeeEntity>();
  
  employees.forEach(emp => {
    employeeMap.set(emp.id, { ...emp, subordinates: [] });
  });

  const rootEmployees: EmployeeEntity[] = [];
  
  employeeMap.forEach(employee => {
    if (employee.manager_id === null) {
      rootEmployees.push(employee);
    } else {
      const manager = employeeMap.get(employee.manager_id);
      if (manager) {
        employee.manager = manager;
        manager.subordinates?.push(employee);
      }
    }
  });

  return rootEmployees;
};

export const OrgChartApp: React.FC = () => {
  const loading = useDisclosure()

  const [expandedNodes, setExpandedNodes] = React.useState<Set<number>>(new Set([1]));

  const hierarchicalEmployees = buildHierarchy(employeesData);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const swapyRef = React.useRef<Swapy | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        animation: 'dynamic',
        dragAxis: 'both',
        autoScrollOnDrag: true,
        enabled: true,
      })

      swapyRef.current.onSwapEnd((event) => {
        if (!event.hasChanged) return;

        // Get the updated slot-item mapping
        const slotItemPairs = event.slotItemMap.asArray;
        
        // Find the dragged and target items from the last swap
        const draggedPair = slotItemPairs.find(pair => pair.item.startsWith('emp-'));
        if (!draggedPair) return;

        const draggedId = draggedPair.item.replace(/emp-/, '');
        const newManagerId = draggedPair.slot.replace(/emp-/, '');
        
        const draggedEmployee = employeesData.find(emp => emp.id === Number(draggedId));
        const targetEmployee = employeesData.find(emp => emp.id === Number(newManagerId));

        if (!draggedEmployee || !targetEmployee) return;

        // Prevent dropping on self or current manager
        if (draggedEmployee.id === targetEmployee.id || draggedEmployee.manager_id === targetEmployee.id) {
          toast.error('Invalid drop target: Cannot drop on self or current manager');
          return;
        }

        // Prevent dropping if target is a subordinate of the dragged employee
        if (isSubordinate(draggedEmployee.id, targetEmployee.id)) {
          toast.error('Invalid drop target: Cannot move manager under their subordinate');
          return;
        }

        // Update the manager_id
        const index = employeesData.findIndex(emp => emp.id === draggedEmployee.id);
        if (index !== -1) {
          employeesData[index] = { ...draggedEmployee, manager_id: targetEmployee.id };
          toast.success(`Updated ${draggedEmployee.name}'s manager to ${targetEmployee.name}`);
          // Force a re-render
          setExpandedNodes(new Set(expandedNodes));
        }
      });
    }
    
    return () => {
      swapyRef.current?.destroy()
    }
  }, [employeesData, expandedNodes])

  const isSubordinate = (managerId: number, targetId: number): boolean => {
    const manager = employeesData.find(emp => emp.id === managerId);
    return manager?.subordinates?.some(emp => 
      emp.id === targetId || isSubordinate(emp.id, targetId)
    ) ?? false;
  };

  return (
    <div className="p-8">
      <div 
        className="flex justify-center overflow-x-auto h-screen min-w-full bg-white"
        ref={containerRef}
        style={{
          padding: '3rem',
          backgroundColor: '#ffffff',
        }}
      >
        {hierarchicalEmployees.map(employee => (
          <EmployeeNode key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};