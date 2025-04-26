// src/app/api/__tests__/EmployeeManagement.integration.spec.ts

// 1) Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
    auth: jest.fn(),
  }));
  import { auth } from "@clerk/nextjs/server";
  
  // 2) Mock drizzle-orm core + relations + sql
  jest.mock("drizzle-orm", () => ({
    eq:       jest.fn((col: any, val: any) => ({ col, val, op: "eq" })),
    and:      jest.fn((...args: any[])     => ({ args, op: "and" })),
    ne:       jest.fn((col: any, val: any) => ({ col, val, op: "ne" })),
    relations: jest.fn((_t: any, _cb: any) => ({})),
    sql:      jest.fn((literals: TemplateStringsArray, ..._: any[]) =>
                 literals.join("")),
  }));
  
  // 3) Mock your database client
  jest.mock("~/server/db/index", () => {
    const m = {
      select:   jest.fn().mockReturnThis(),
      from:     jest.fn().mockReturnThis(),
      where:    jest.fn().mockReturnThis(),
      insert:   jest.fn().mockReturnThis(),
      values:   jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update:   jest.fn().mockReturnThis(),
      set:      jest.fn().mockReturnThis(),
      delete:   jest.fn().mockReturnThis(),
    };
    return { db: m };
  });
  import { db } from "~/server/db/index";
  
  // 4) Mock your API routes
  import { POST as SignupEmployerCompany } from "~/app/api/signup/employerCompany/route";
  import { POST as SignupEmployee        } from "~/app/api/signup/employee/route";
  import { POST as GetAllEmployees       } from "~/app/api/getAllEmployees/route";
  import { POST as ApproveEmployee       } from "~/app/api/approveEmployees/route";
  import { POST as RemoveEmployee        } from "~/app/api/removeEmployees/route";
  
  describe("Employee Management Integration Flow", () => {
    const employerUserId   = "employer-001";
    const employeeUserId   = "employee-002";
    const companyName      = "IntegrationTest Co.";
    const employerPasskey  = "employerPass123";
    const employeePasskey  = "employeePass456";
    const mockCompanyId    = 555;
    const mockEmployeeDbId = 777;
  
    beforeEach(() => {
      jest.clearAllMocks();
      (auth as jest.Mock).mockResolvedValue({ userId: employerUserId });
    });
  
    it("should handle employer signup, employee signup, approval, and removal", async () => {
      //
      // --- Stage 1: Employer & Company Signup ---
      //
      (db.where as jest.Mock)
        .mockReturnThis()            
        .mockResolvedValueOnce([]);
  
      // 2) insert(company).values().returning() → return companyId
      (db.returning as jest.Mock)
        .mockResolvedValueOnce([{ id: mockCompanyId }]);
  
      // 3) insert(owner user) → 不抛错误
      (db.insert as jest.Mock).mockReturnThis();
      (db.values as jest.Mock).mockReturnThis();
  
      const signupCompanyRequest = {
        json: jest.fn().mockResolvedValue({
          name:            companyName,
          email:           "employer@test.co",
          companyName,
          employerPasskey,
          employeePasskey,
          numberOfEmployees: "5",
        }),
      } as unknown as Request;
  
      const signupCompanyResponse = await SignupEmployerCompany(signupCompanyRequest);
      expect(signupCompanyResponse.status).toBe(200);
      expect((await signupCompanyResponse.json()).success).toBe(true);
      expect(db.insert).toHaveBeenCalledTimes(2);
  
      //
      // --- Stage 2: Employee Signup ---
      //
      (db.where as jest.Mock)
        .mockReturnThis()
        .mockResolvedValueOnce([
          {
            id: mockCompanyId,
            name: companyName,
            employeePasskey: employeePasskey,
          },
        ]);
  
      (db.insert as jest.Mock).mockReturnThis();
      (db.values as jest.Mock).mockReturnThis();
  
      const signupEmployeeRequest = {
        json: jest.fn().mockResolvedValue({
          name:             "Test Employee",
          email:            "employee@test.co",
          employeePasskey,             
          companyName,
        }),
      } as unknown as Request;
  
      const signupEmployeeResponse = await SignupEmployee(signupEmployeeRequest);
      expect(signupEmployeeResponse.status).toBe(200);
      expect((await signupEmployeeResponse.json()).success).toBe(true);
      // company + owner + employee
      expect(db.insert).toHaveBeenCalledTimes(3);
  
      //
      // --- Stage 3: Employer Gets All Employees ---
      
      (db.where as jest.Mock)
        .mockReturnThis()
        .mockResolvedValueOnce([
          { companyId: mockCompanyId, userId: employerUserId, name: "Test Employer", role: "owner" },
        ])
        .mockResolvedValueOnce([
          { id: 111,             userId: employerUserId,   name: "Test Employer", role: "owner",   status: "verified" },
          { id: mockEmployeeDbId, userId: employeeUserId, name: "Test Employee",  role: "employee", status: "pending"  },
        ]);
  
      const getEmployeesRequest = {
        json: jest.fn().mockResolvedValue({}),  // auth() 已经给 userId
      } as unknown as Request;
  
      const getEmployeesResponse = await GetAllEmployees(getEmployeesRequest);
      expect(getEmployeesResponse.status).toBe(200);  // 注意：这里用你实际的变量名
      const employeesData = await getEmployeesResponse.json();
      expect(employeesData).toHaveLength(2);
      expect(employeesData.find((e: any) => e.userId === employeeUserId).status).toBe("pending");
  
      //
      // --- Stage 4: Employer Approves Employee ---
      //
      (db.update as jest.Mock).mockReturnThis();
      (db.set    as jest.Mock).mockReturnThis();
      (db.where  as jest.Mock).mockReturnThis().mockResolvedValueOnce(undefined);
  
      const approveRequest = {
        json: jest.fn().mockResolvedValue({ employeeId: mockEmployeeDbId.toString() }),
      } as unknown as Request;
  
      const approveResponse = await ApproveEmployee(approveRequest);
      expect(approveResponse.status).toBe(200);
      expect(db.set).toHaveBeenCalledWith({ status: "verified" });
  
      //
      // --- Stage 5: Employer Removes Employee ---
      //
      (db.delete as jest.Mock).mockReturnThis();
      (db.where  as jest.Mock).mockReturnThis().mockResolvedValueOnce(undefined);
  
      const removeRequest = {
        json: jest.fn().mockResolvedValue({ employeeId: mockEmployeeDbId.toString() }),
      } as unknown as Request;
  
      const removeResponse = await RemoveEmployee(removeRequest);
      expect(removeResponse.status).toBe(200);
      expect(db.delete).toHaveBeenCalled();
      expect((db.where as jest.Mock).mock.calls.slice(-1)[0][0])
        .toEqual(expect.objectContaining({ val: mockEmployeeDbId }));
    });
  });
  