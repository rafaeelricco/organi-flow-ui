'use client'

import * as React from 'react';

import { fetcher } from '@/lib/fetcher';
import { EmployeeEntity } from '@/types/employee';
import { toast } from 'sonner';
import { createSwapy, Swapy } from 'swapy';
import { EmployeeNode } from './employee-node';

import useSWR from 'swr';
import { EmployeeNodeSkeleton } from './employee-node-skeleton';

const employeesData: EmployeeEntity[] = [
  { "id": 1, "name": "John Smith", "title": "CEO", "manager_id": null },
  { "id": 2, "name": "Sarah Johnson", "title": "CTO", "manager_id": 1 },
  { "id": 3, "name": "David Wilson", "title": "Product Director", "manager_id": 1 },
  { "id": 4, "name": "Lisa Brown", "title": "HR Director", "manager_id": 1 },
  { "id": 5, "name": "Michael Chen", "title": "Engineering Manager", "manager_id": 2 },
  { "id": 6, "name": "Peter Anderson", "title": "Product Manager", "manager_id": 3 },
  { "id": 7, "name": "Rachel Torres", "title": "HR Manager", "manager_id": 4 },
  { "id": 8, "name": "James Taylor", "title": "Frontend Lead", "manager_id": 5 },
  { "id": 9, "name": "Maria Garcia", "title": "Backend Lead", "manager_id": 5 },
  { "id": 10, "name": "Thomas Wright", "title": "UX Designer", "manager_id": 6 },
  { "id": 11, "name": "Amanda White", "title": "Senior UX Designer", "manager_id": 6 },
  { "id": 12, "name": "Sophie Chen", "title": "Senior HR Specialist", "manager_id": 7 },
  { "id": 13, "name": "Robert Johnson", "title": "Junior UX Designer", "manager_id": 11 },
  { "id": 14, "name": "Emily Davis", "title": "Senior Developer", "manager_id": 12 },
  { "id": 15, "name": "Sam Smith", "title": "Senior Developer", "manager_id": 9 },
  { "id": 16, "name": "Alex Thompson", "title": "Junior Developer", "manager_id": 14 },
  { "id": 17, "name": "Mark Wilson", "title": "HR Analyst", "manager_id": 12 },
  { "id": 18, "name": "Julia Santos", "title": "Recruitment Specialist", "manager_id": 12 },
  { "id": 19, "name": "Daniel Lee", "title": "Junior Developer", "manager_id": 18 },
  { "id": 20, "name": "Isabella Martinez", "title": "Senior Developer", "manager_id": 15 },
  { "id": 21, "name": "Oliver Brown", "title": "Senior Developer", "manager_id": 13 },
  { "id": 22, "name": "Ava Johnson", "title": "Senior Developer", "manager_id": 17 },
];

const buildHierarchy = (employees: EmployeeEntity[]): EmployeeEntity[] => {
  const employeeMap = new Map<number, EmployeeEntity>();
  
  // Sort employees by position first, fallback to name if position is not available
  const sortedEmployees = [...employees].sort((a, b) => {
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position;
    }
    return a.name.localeCompare(b.name);
  });
  
  sortedEmployees.forEach(emp => {
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

  // Sort subordinates by position
  const sortEmployees = (employees: EmployeeEntity[]) => {
    employees.sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return a.name.localeCompare(b.name);
    });
    employees.forEach(emp => {
      if (emp.subordinates && emp.subordinates.length > 0) {
        sortEmployees(emp.subordinates);
      }
    });
  };

  sortEmployees(rootEmployees);

  return rootEmployees;
};

const unBuildHierarchy = (hierarchicalEmployees: EmployeeEntity[]): EmployeeEntity[] => {
  const flatEmployees: EmployeeEntity[] = [];
  
  const flattenHierarchy = (employees: EmployeeEntity[]) => {
    employees.forEach(emp => {
      // Create a new employee object without the hierarchical properties
      const flatEmployee = {
        id: emp.id,
        name: emp.name,
        title: emp.title,
        manager_id: emp.manager_id
      };
      
      flatEmployees.push(flatEmployee);
      
      // Recursively process subordinates if they exist
      if (emp.subordinates && emp.subordinates.length > 0) {
        flattenHierarchy(emp.subordinates);
      }
    });
  };
  
  flattenHierarchy(hierarchicalEmployees);
  return flatEmployees;
};

const updateEmployeesPositions = async (employees: EmployeeEntity[]) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/batch-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employees }),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar posições');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const OrgChartApp: React.FC = () => {
  const { data: apiData, error, isLoading, mutate } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/employees`, fetcher)

  const mockEmployees = buildHierarchy(employeesData);

  const [employees, setEmployees] = React.useState<EmployeeEntity[]>([]);

  React.useEffect(() => {
    if (apiData) {
      const sortedEmployees = buildHierarchy(apiData);
      setEmployees(sortedEmployees);
    }
  },[apiData])

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

      swapyRef.current.onBeforeSwap((event) => {
        console.log('beforeSwap', event)
        // This is for dynamically enabling and disabling swapping.
        // Return true to allow swapping, and return false to prevent swapping.
        return true
     })
     swapyRef.current.onSwapStart((event) => {
        console.log('start', event)
     })
     swapyRef.current.onSwap(async(event) => {
        console.log('swap event:', event);
     })
     swapyRef.current.onSwapEnd(async(event) => {
      try {
        const itensOrder = swapyRef.current?.slotItemMap();
        const itensOrderArray = itensOrder?.asArray
          .map((item) => item.item)
          .map((item) => item.replace(/emp-/, ''))
          .map((item) => item.replace(/-item/, ''))
          .map((item) => Number(item));

        if (!itensOrderArray) return;

        const unHierarchicalEmployees = unBuildHierarchy(employees);
        const updatedEmployees: EmployeeEntity[] = unHierarchicalEmployees.map((employee) => {
          const newPosition = itensOrderArray.indexOf(employee.id);
          return {
            ...employee,
            position: newPosition >= 0 ? newPosition : employee.position
          };
        });

        await updateEmployeesPositions(updatedEmployees);
        await mutate();
        toast.success('Posições atualizadas com sucesso!');
        
      } catch (error) {
        console.error('Erro ao trocar posições:', error);
        toast.error('Erro ao trocar posições dos funcionários');
      }
     })
    }
    
    return () => {
      swapyRef.current?.destroy();
    }
  }, [employees, mutate]);

  return (
      <div 
        className="flex justify-center overflow-auto min-h-screen w-screen bg-white p-12"
        ref={containerRef}
      >
        {isLoading ? (
          <React.Fragment>
            {mockEmployees.map(employee => (
              <EmployeeNodeSkeleton key={employee.id} employee={employee} />
            ))}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {employees?.map(employee => (
              <EmployeeNode key={employee.id} employee={employee} />
            ))}
          </React.Fragment>
        )}
      </div>
  );
};