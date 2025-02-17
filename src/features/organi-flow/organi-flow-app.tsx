'use client'

import * as React from 'react';

import { fetcher } from '@/lib/fetcher';
import { EmployeeEntity } from '@/types/employee';
import { toast } from 'sonner';
import { createSwapy, Swapy } from 'swapy';

import Tree, { RawNodeDatum } from 'react-d3-tree';
import useSWR from 'swr';
import { NodeLabel } from './node-label';

export const OrgChartApp: React.FC = () => {
  const { data: apiData, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/employees`, fetcher);

  const [treeData, setTreeData] = React.useState<TreeNode | null>(null);

  React.useEffect(() => {
    if (apiData) {
      const hierarchicalData = buildHierarchy(apiData);
      const transformedData = transformToTreeData(hierarchicalData);
      setTreeData(transformedData);
    }
  }, [apiData]);

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

        // const unHierarchicalEmployees = unBuildHierarchy(employees);
        // const updatedEmployees: EmployeeEntity[] = unHierarchicalEmployees.map((employee) => {
        //   const newPosition = itensOrderArray.indexOf(employee.id);
        //   return {
        //     ...employee,
        //     position: newPosition >= 0 ? newPosition : employee.position
        //   };
        // });

        // await updateEmployeesPositions(updatedEmployees);
        // await mutate();
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
  }, [treeData]);

  return (
    <div className="w-screen h-screen bg-white" ref={containerRef}>
      <div id="treeWrapper" style={{ width: '100%', height: '100%' }}>
        {isLoading ? (
          <div>Loading...</div>
        ) : treeData && (
          <Tree 
            draggable
            data={treeData}
            orientation="vertical"
            translate={{ x: 900, y: 100 }}
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            nodeSize={{ x: 150, y: 150 }}
            renderCustomNodeElement={(props) => <NodeLabel {...props} />}
            pathFunc="step"
          />
        )}
      </div>
    </div>
  );
};

const buildHierarchy = (employees: EmployeeEntity[]): EmployeeEntity[] => {
  const employeeMap = new Map<number, EmployeeEntity>();
  
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

interface TreeNode extends RawNodeDatum {
  name: string;
  attributes?: {
    title: string;
    manager: string;
  };
  children?: TreeNode[];
}

const transformToTreeData = (employees: EmployeeEntity[]): TreeNode => {
  const convertEmployee = (employee: EmployeeEntity): TreeNode => {
    return {
      name: employee.name,
      attributes: {
        title: employee.title,
        manager: employee.manager?.name || 'None'
      },
      children: employee.subordinates && employee.subordinates.length > 0
        ? employee.subordinates.map(sub => convertEmployee(sub))
        : []
    };
  };

  if (employees.length === 0) {
    return {
      name: 'No Data',
      children: []
    };
  }

  return convertEmployee(employees[0]);
};
