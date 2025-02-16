'use client'

import { Card, CardContent } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { createSwapy, Swapy } from 'swapy';

interface EmployeeEntity {
   id: number
   name: string
   title: string
   manager_id: number | null
   subordinates?: EmployeeEntity[]
   manager?: EmployeeEntity
}

// Mock data
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

const OrgChart = () => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1]));
  const [draggedEmployee, setDraggedEmployee] = useState<EmployeeEntity | null>(null);
  const hierarchicalEmployees = buildHierarchy(employeesData);
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<Swapy | null>(null);

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

  const toggleNode = (employeeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, employee: EmployeeEntity) => {
    setDraggedEmployee(employee);
    e.dataTransfer.setData('text/plain', employee.id.toString());
    // Create a ghost image
    const ghost = document.createElement('div');
    ghost.classList.add('bg-white', 'p-2', 'rounded', 'shadow');
    ghost.textContent = employee.name;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const showStatusMessage = (message: string) => {
    if (loading) {
      toast.loading(message);
    } else {
      toast.success(message);
    }
  };

  const handleDrop = async (e: React.DragEvent, newManager: EmployeeEntity) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    if (!draggedEmployee) return;

    // Prevent dropping on self or current manager
    if (draggedEmployee.id === newManager.id || draggedEmployee.manager_id === newManager.id) {
      toast.error('Invalid drop target: Cannot drop on self or current manager');
      return;
    }

    // Prevent dropping on subordinates
    const getAllSubordinateIds = (emp: EmployeeEntity): number[] => {
      const ids: number[] = [];
      if (emp.subordinates) {
        emp.subordinates.forEach(sub => {
          ids.push(sub.id);
          ids.push(...getAllSubordinateIds(sub));
        });
      }
      return ids;
    };

    if (getAllSubordinateIds(draggedEmployee).includes(newManager.id)) {
      toast.error('Invalid drop target: Cannot drop on subordinate');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the data
      const updatedEmployee = { ...draggedEmployee, manager_id: newManager.id };
      const index = employeesData.findIndex(emp => emp.id === draggedEmployee.id);
      if (index !== -1) {
        employeesData[index] = updatedEmployee;
      }

      toast.success(`Updated ${draggedEmployee.name}'s manager to ${newManager.name}`);
      // Expand the new manager's node
      setExpandedNodes(prev => new Set([...prev, newManager.id]));
    } catch (error) {
      toast.error('Error updating manager');
    } finally {
      setLoading(false);
      setDraggedEmployee(null);
    }
  };

  const EmployeeNode = ({ employee }: { employee: EmployeeEntity }) => {
    const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;
    const isExpanded = expandedNodes.has(employee.id);

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
        
        {hasSubordinates && isExpanded && (
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

  return (
    <div className="p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Organization Chart</h1>
      </div>
      
      <div className="flex justify-center overflow-x-auto" ref={containerRef}>
        {hierarchicalEmployees.map(employee => (
          <EmployeeNode key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default OrgChart;