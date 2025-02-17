'use client'

import * as React from 'react';

import { useElementSize } from '@/hooks/useElementSize';
import { fetcher } from '@/lib/fetcher';
import { EmployeeEntity } from '@/types/employee';
import Tree from 'react-d3-tree';
import { createSwapy, Swapy } from 'swapy';
import useSWR from 'swr';
import { NodeLabel } from './node-label';

export const OrgChartApp: React.FC = () => {
  const { data: apiData, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/employees`, fetcher)

  // const [apiData, setapiData] = React.useState<TreeNode | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const swapyRef = React.useRef<Swapy | null>(null);
  
  const { ref: sizeRef, width: containerWidth, height: containerHeight } = useElementSize<HTMLDivElement>();

  const setRefs = (element: HTMLDivElement | null) => {
    containerRef.current = element;
    sizeRef.current = element;
  };

  const centerPosition = React.useMemo(() => ({
    x: containerWidth / 2,
    y: containerHeight / 5
  }), [containerWidth, containerHeight]);

  React.useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        animation: 'none',
        dragAxis: 'both',
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
      console.log('swap end', event)

      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-manager`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json'},
      //   body: JSON.stringify(treeData),
      // });
      
      
     })
    }
    
    return () => {
      swapyRef.current?.destroy();
    }
  }, [apiData]);

  return (
    <div className="w-screen h-screen bg-white" ref={setRefs}>
      <div style={{ width: '100%', height: '100%' }} >
        {isLoading ? (
          <div>Loading...</div>
        ) : apiData && (
          <Tree 
            data={apiData}
            draggable={false}
            hasInteractiveNodes
            orientation="vertical"
            enableLegacyTransitions
            translate={centerPosition}
            nodeSize={{ x: 150, y: 150 }}
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            renderCustomNodeElement={(props) => (
                <foreignObject width="200" height="300" x="-100">
                  <NodeLabel {...props} />
                </foreignObject>
            )}
          />
        )}
      </div>
    </div>
  );
};

const buildHierarchy = (employees: EmployeeEntity[]): EmployeeEntity[] => {
  if (!Array.isArray(employees)) {
    console.error('Expected employees to be an array, received:', employees);
    return [];
  }

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

const transformToapiData = (employees: EmployeeEntity[]): TreeNode => {
  const convertEmployee = (employee: EmployeeEntity): TreeNode => {
    return {
      name: employee.name,
      attributes: {
        id: employee.id,
        title: employee.title,
        manager_id: employee.manager?.id || 0
      },
      children: employee.subordinates && employee.subordinates.length > 0
        ? employee.subordinates.map(sub => convertEmployee(sub))
        : []
    };
  };

  if (employees.length === 0) {
    return {
      name: 'No Data',
      attributes: {
        id: 0,
        title: 'No Data',
        manager_id: 0
      },
      children: []
    };
  }

  return convertEmployee(employees[0]);
};


const unBuildapiData = (apiData: TreeNode): EmployeeEntity[] => {
  const flatten: EmployeeEntity[] = [];

  const traverse = (node: TreeNode) => {
    flatten.push({
      id: node.attributes.id,
      name: node.name,
      title: node.attributes.title,
      manager_id: node.attributes.manager_id || null
    });
    node.children?.forEach(traverse);
  };

  traverse(apiData);
  return flatten;
};