// src/app/api/__tests__/DocumentUploadQuery.integration.spec.ts

// 1) Global fetch stub: Next.js handler uses global.fetch
import fetch from 'node-fetch';
jest.mock('node-fetch', () =>
  jest.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => Buffer.from('dummy pdf content'),
  })
);
;(global as any).fetch = jest.mocked(fetch);

// 2) Mock drizzle-orm: eq, sql, relations
jest.mock('drizzle-orm', () => ({
  eq:        jest.fn((col: any, val: any) => ({ column: col, value: val, operator: '=' })),
  sql:       jest.fn((literals: TemplateStringsArray, ..._: any[]) => literals.join('')),
  relations: jest.fn((_t: any, _cb: any) => ({})),
}));

// 3) Mock db client: chainable methods return this
jest.mock('~/server/db/index', () => ({
  db: {
    select:    jest.fn().mockReturnThis(),
    from:      jest.fn().mockReturnThis(),
    where:     jest.fn().mockReturnThis(),
    insert:    jest.fn().mockReturnThis(),
    values:    jest.fn().mockReturnThis(),
    returning: jest.fn(),
    execute:   jest.fn(),
  },
}));
import { db } from '~/server/db/index';

// 4) Mock fs/promises & os.tmpdir
import fs from 'fs/promises';
import os from 'os';
jest.mock('fs/promises', () => ({ writeFile: jest.fn().mockResolvedValue(undefined) }));
jest.mock('os', () => ({ tmpdir: jest.fn().mockReturnValue('/tmp') }));

// 5) Mock LangChain components
jest.mock('@langchain/community/document_loaders/fs/pdf', () => ({
  PDFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue([
      { pageContent: 'Mock PDF page 1 content.', metadata: { loc: { pageNumber: 1 } } },
      { pageContent: 'Mock PDF page 2 content about testing.', metadata: { loc: { pageNumber: 2 } } },
    ]),
  })),
}));
jest.mock('@langchain/textsplitters', () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    splitDocuments: jest.fn(docs => Promise.resolve(docs)),
  })),
}));
jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedDocuments: jest.fn().mockResolvedValue([Array(1536).fill(0.1), Array(1536).fill(0.2)]),
    embedQuery:     jest.fn().mockResolvedValue(Array(1536).fill(0.5)),
  })),
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue({ text: 'This is the AI answer about testing.' }),
  })),
}));

// 6) Import route handlers after mocks
import { POST as UploadDocument } from '~/app/api/uploadDocument/route';
import { POST as AskQuestion    } from '~/app/api/LangChain/route';

describe('Document Upload and Query Integration Flow', () => {
  const userId           = 'user-test-123';
  const companyId        = 'company-abc';
  const documentName     = 'Integration Test Doc';
  const documentUrl      = 'http://example.com/integration.pdf';
  const documentCategory = 'Testing';
  const mockDocumentId   = 987;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a document and return 201', async () => {
    // — Stage 1: Verify user-company relationship
    (db.where as jest.Mock)
      .mockReturnThis()            // maintain chainability
      .mockResolvedValueOnce([{ companyId }]);

    // — Stage 2: Insert document and return id
    (db.returning as jest.Mock)
      .mockResolvedValueOnce([{ id: mockDocumentId }]);

    const uploadReq = {
      json: jest.fn().mockResolvedValue({
        userId,
        documentName,
        documentUrl,
        documentCategory,
      }),
    } as unknown as Request;

    const uploadRes = await UploadDocument(uploadReq);
    expect(uploadRes.status).toBe(201);

    const uploadData = await uploadRes.json();
    expect(uploadData.document.id).toBe(mockDocumentId);
    expect(uploadData.message).toMatch(/successfully/i);

    // Validate key calls
    expect(db.select).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalledTimes(2);      // documents + pdfChunks
    expect(fetch).toHaveBeenCalledWith(documentUrl);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should ask a question and return 200', async () => {
    (db.execute as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: 1, content: 'Mock PDF page 1 content.', page: 1, distance: 0.15 },
        { id: 2, content: 'Mock PDF page 2 content about testing.', page: 2, distance: 0.25 },
      ],
    });

    const questionReq = {
      json: jest.fn().mockResolvedValue({
        documentId: mockDocumentId,
        question:   'What is this document about?',
      }),
    } as unknown as Request;

    const questionRes = await AskQuestion(questionReq);
    expect(questionRes.status).toBe(200);

    const questionData = await questionRes.json();
    expect(questionData.success).toBe(true);
    expect(questionData.summarizedAnswer).toBe('This is the AI answer about testing.');
    expect(questionData.recommendedPages).toEqual([1, 2]);
  });
});
