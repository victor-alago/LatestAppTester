import { Response } from 'express';

const notFound = (res: Response) => {
  const err = new Error("Not Found");
  res.status(404).json({
    error: {
      message: err.message,
    },
  });
};

export default notFound;