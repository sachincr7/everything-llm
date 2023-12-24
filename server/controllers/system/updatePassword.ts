import { Request, Response } from 'express';
import { multiUserMode } from '../../utils/http';
import { dumpENV, updateENV } from '../../utils/helpers/updateENV';
import { v4 } from 'uuid';

interface UpdatePasswordRequest extends Request {
  body: {
    usePassword: string;
    newPassword: string;
  };
}

export const updatePassword = async (request: UpdatePasswordRequest, response: Response) => {
  try {
    // Cannot update password in multi - user mode.
    if (multiUserMode(response)) {
      response.sendStatus(401).end();
      return;
    }

    const { usePassword, newPassword } = request.body;
    const { error } = updateENV(
      {
        AuthToken: usePassword ? newPassword : '',
        JWTSecret: usePassword ? v4() : '',
      },
      true
    );
    if (process.env.NODE_ENV === 'production') await dumpENV();
    response.status(200).json({ success: !error, error });
  } catch (error: any) {
    console.log(error.message, error);
    response.sendStatus(500).end();
  }
};
