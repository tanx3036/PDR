// src/app/api/__tests__/QuestionHistory.integration.spec.ts

// 1) Mock the database client; chainable methods return this by default
jest.mock('~/server/db/index', () => ({
    db: {
      select:  jest.fn().mockReturnThis(),
      from:    jest.fn().mockReturnThis(),
      where:   jest.fn().mockReturnThis(),
      insert:  jest.fn().mockReturnThis(),
      values:  jest.fn().mockResolvedValue(undefined),
      execute: jest.fn(),
    },
  }));
  import { db } from '~/server/db/index';
  
  // 2) Stub out ChatOpenAI.call on every instance, and mock OpenAIEmbeddings.embedQuery
  const chatCallMock = jest.fn();
  jest.mock('@langchain/openai', () => ({
    OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
      embedQuery: jest.fn().mockResolvedValue(Array(1536).fill(0.5)),
    })),
    ChatOpenAI: jest.fn().mockImplementation(() => ({
      call: chatCallMock,
    })),
  }));
  import { ChatOpenAI } from '@langchain/openai';
  
  // 3) Mock drizzle-orm functions so your schema loads without errors
  jest.mock('drizzle-orm', () => ({
    eq:        jest.fn((col: any, val: any) => ({ col, val, op: 'eq' })),
    and:       jest.fn((...args: any[])      => ({ args, op: 'and' })),
    sql:       jest.fn((lits: TemplateStringsArray, ..._: any[]) => lits.join('')),
    relations: jest.fn(() => ({})),
  }));
  import { and } from 'drizzle-orm';
  
  // 4) Import your route handlers after setting up all mocks
  import { POST as AskQuestion }          from '~/app/api/LangChain/route';
  import { POST as AddQuestionHistory }   from '~/app/api/Questions/add/route';
  import { POST as FetchQuestionHistory } from '~/app/api/Questions/fetch/route';
  
  describe('Question and History Integration Flow', () => {
    const userId        = 'user-hist-456';
    const documentId    = 101;
    const documentTitle = 'History Test Doc';
    const question      = 'What is the main topic?';
    const mockAnswer    = 'The main topic is integration testing.';
    const mockPages     = [1, 3];
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should allow asking a question, saving it to history, and fetching it', async () => {
      // Stage 1: Ask question via the LangChain endpoint
      (db.execute as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: 201, content: 'Some context about integration testing.', page: 1, distance: 0.1 },
          { id: 202, content: 'More context on page 3.', page: 3, distance: 0.2 },
        ],
      });
      // Stub the chat call used inside your route
      chatCallMock.mockResolvedValueOnce({ text: mockAnswer });
  
      const askRequest = {
        json: jest.fn().mockResolvedValue({ documentId, question }),
      } as unknown as Request;
  
      const askResponse = await AskQuestion(askRequest);
      expect(askResponse.status).toBe(200);
      const askData = await askResponse.json();
      expect(askData.success).toBe(true);
      expect(askData.summarizedAnswer).toBe(mockAnswer);
  
      // Stage 2: Add question to history
      // The default db.insert / db.values mocks already resolve successfully
      const addHistoryRequest = {
        json: jest.fn().mockResolvedValue({
          userId,
          question,
          documentId:    documentId.toString(),
          documentTitle,
          response:      mockAnswer,
          pages:         mockPages,
        }),
      } as unknown as Request;
  
      const addHistoryResponse = await AddQuestionHistory(addHistoryRequest);
      expect(addHistoryResponse.status).toBe(200);
      const addHistoryData = await addHistoryResponse.json();
      expect(addHistoryData.success).toBe(true);
  
      // Verify that exactly one insert/values pair was called
      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          UserId:     userId,
          question,
          documentId: documentId.toString(),
          response:   mockAnswer,
          pages:      mockPages,
        })
      );
  
      // Stage 3: Fetch question history
      (db.where as jest.Mock).mockResolvedValueOnce([
        {
          id:            999,
          UserId:        userId,
          documentId:    documentId.toString(),
          documentTitle,
          question,
          response:      mockAnswer,
          pages:         mockPages,
          createdAt:     new Date().toISOString(),
        },
      ]);
  
      const fetchHistoryRequest = {
        json: jest.fn().mockResolvedValue({ userId, documentId: documentId.toString() }),
      } as unknown as Request;
  
      const fetchHistoryResponse = await FetchQuestionHistory(fetchHistoryRequest);
      expect(fetchHistoryResponse.status).toBe(200);
      const fetchHistoryData = await fetchHistoryResponse.json();
      expect(fetchHistoryData.success).toBe(true);
      expect(fetchHistoryData.chatHistory).toHaveLength(1);
      expect(fetchHistoryData.chatHistory[0].question).toBe(question);
      expect(fetchHistoryData.chatHistory[0].response).toBe(mockAnswer);
      expect(fetchHistoryData.chatHistory[0].documentId).toBe(documentId.toString());
  
      // Ensure the fetch used eq/and
      expect(db.select).toHaveBeenCalledTimes(1);
      expect(db.where).toHaveBeenCalledTimes(1);
      expect(and).toHaveBeenCalled();
    });
  });
  