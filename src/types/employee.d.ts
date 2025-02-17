export interface EmployeeEntity {
   id: number
   name: string
   title: string
   manager_id: number | null
   subordinates?: EmployeeEntity[]
   manager?: EmployeeEntity
   position?: number
}
