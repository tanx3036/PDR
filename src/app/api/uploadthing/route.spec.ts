// src/app/api/uploadthing/route.spec.ts

import { GET, POST } from "./route";

describe("uploadthing route exports", () => {
  it("should export GET and POST handlers", () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe("function");

    expect(POST).toBeDefined();
    expect(typeof POST).toBe("function");
  });
});
