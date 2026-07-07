const SuccessResponse = (message, data, res) => {
  return res.status(200).json({
    message,
    data,
    success: true,
  });
};

export default SuccessResponse;
