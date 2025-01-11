import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {  ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";