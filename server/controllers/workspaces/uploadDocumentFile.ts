import { Request, Response } from "express";
import { checkPythonAppAlive } from "../../utils/files/documentProcessor";

interface UploadDocumentFilerequest extends Request {
  file: {
    originalname: string;
  }
}

const uploadDocumentFile = async (request: UploadDocumentFilerequest, response: Response) => {
  const { originalname } = request.file;
  const processingOnline = await checkPythonAppAlive();

  if (!processingOnline) {
    response
      .status(500)
      .json({
        success: false,
        error: `Python processing API is not online. Document ${originalname} will not be processed automatically.`,
      })
      .end();
    return;
  }
}