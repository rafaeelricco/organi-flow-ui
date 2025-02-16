'use client'

import * as React from 'react';

import { fetcher } from '@/lib/fetcher';
import { EmployeeEntity } from '@/types/employee';
import { toast } from 'sonner';
import { createSwapy, Swapy } from 'swapy';
import { EmployeeNode } from './employee-node';

import useSWR from 'swr';

const employeesData: EmployeeEntity[] = [
  // Nível 1 - CEO
  { id: 1, name: "John Smith", title: "CEO", manager_id: null },
  
  // Nível 2 - Diretores reportando ao CEO
  { id: 2, name: "Sarah Johnson", title: "CTO", manager_id: 1 },
  { id: 3, name: "David Wilson", title: "Product Director", manager_id: 1 },
  { id: 4, name: "Lisa Brown", title: "HR Director", manager_id: 1 },
  
  // Nível 3 - Gerentes e Líderes
  { id: 5, name: "Michael Chen", title: "Engineering Manager", manager_id: 2 },
  { id: 6, name: "Peter Anderson", title: "Product Manager", manager_id: 3 },
  { id: 7, name: "Rachel Torres", title: "HR Manager", manager_id: 4 },
  
  // Nível 4 - Líderes Técnicos e Especialistas
  { id: 8, name: "James Taylor", title: "Frontend Lead", manager_id: 5 },
  { id: 9, name: "Maria Garcia", title: "Backend Lead", manager_id: 5 },
  { id: 10, name: "Thomas Wright", title: "UX Designer", manager_id: 6 },
  { id: 11, name: "Amanda White", title: "Senior UX Designer", manager_id: 6 },
  { id: 12, name: "Sophie Chen", title: "Senior HR Specialist", manager_id: 7 },
  
  // Nível 5 - Profissionais
  { id: 13, name: "Robert Johnson", title: "Junior UX Designer", manager_id: 11 },
  { id: 14, name: "Emily Davis", title: "Senior Developer", manager_id: 8 },
  { id: 15, name: "Sam Smith", title: "Senior Developer", manager_id: 9 },
  { id: 16, name: "Alex Thompson", title: "Junior Developer", manager_id: 14 },
  { id: 17, name: "Mark Wilson", title: "HR Analyst", manager_id: 12 },
  { id: 18, name: "Julia Santos", title: "Recruitment Specialist", manager_id: 12 },
  { id: 19, name: "Daniel Lee", title: "Junior Developer", manager_id: 18 },
  { id: 20, name: "Isabella Martinez", title: "Senior Developer", manager_id: 15 },
  { id: 21, name: "Oliver Brown", title: "Senior Developer", manager_id: 13 },
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

  const sortEmployees = (employees: EmployeeEntity[]) => {
    employees.sort((a, b) => a.name.localeCompare(b.name));
    employees.forEach(emp => {
      if (emp.subordinates && emp.subordinates.length > 0) {
        sortEmployees(emp.subordinates);
      }
    });
  };

  sortEmployees(rootEmployees);

  return rootEmployees;
};

export const OrgChartApp: React.FC = () => {
  const { data: apiData, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/employees`, fetcher)

  const [expandedNodes, setExpandedNodes] = React.useState<Set<number>>(new Set([1]));

  const mockEmployees = buildHierarchy(employeesData);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const swapyRef = React.useRef<Swapy | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        animation: 'dynamic',
        dragAxis: 'both',
        autoScrollOnDrag: true,
        enabled: true,
      });

      swapyRef.current.onSwapEnd((event) => {
        if (!event.hasChanged) return;

        const slotItemPairs = event.slotItemMap.asArray;
        
        const draggedPair = slotItemPairs.find(pair => pair.item.startsWith('emp-'));
        if (!draggedPair) return;

        const draggedId = draggedPair.item.replace(/emp-/, '');
        const newManagerId = draggedPair.slot.replace(/emp-/, '');
        
        const draggedEmployee = employeesData.find(emp => emp.id === Number(draggedId));
        const targetEmployee = employeesData.find(emp => emp.id === Number(newManagerId));

        if (!draggedEmployee || !targetEmployee) return;

        if (draggedEmployee.id === targetEmployee.id || draggedEmployee.manager_id === targetEmployee.id) {
          toast.error('Invalid drop target: Cannot drop on self or current manager');
          return;
        }

        if (isSubordinate(draggedEmployee.id, targetEmployee.id)) {
          toast.error('Invalid drop target: Cannot move manager under their subordinate');
          return;
        }

        const index = employeesData.findIndex(emp => emp.id === draggedEmployee.id);
        if (index !== -1) {
          employeesData[index] = { ...draggedEmployee, manager_id: targetEmployee.id };
          toast.success(`Updated ${draggedEmployee.name}'s manager to ${targetEmployee.name}`);
          setExpandedNodes(new Set(expandedNodes));
        }
      });
    }
    
    return () => {
      swapyRef.current?.destroy();
    }
  }, [expandedNodes]);

  const isSubordinate = (managerId: number, targetId: number): boolean => {
    const manager = employeesData.find(emp => emp.id === managerId);
    return manager?.subordinates?.some(emp => 
      emp.id === targetId || isSubordinate(emp.id, targetId)
    ) ?? false;
  };

  return (
    <div className="p-8">
      <div 
        className="flex justify-center overflow-auto min-h-screen min-w-full bg-white"
        ref={containerRef}
        style={{
          padding: '3rem',
          backgroundColor: '#ffffff',
        }}
      >
        {!isLoading ? (
          <React.Fragment>
            {mockEmployees.map(employee => (
              <EmployeeNode key={employee.id} employee={employee} />
            ))}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {apiData?.map(employee => (
              <EmployeeNode key={employee.id} employee={employee} />
            ))}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};