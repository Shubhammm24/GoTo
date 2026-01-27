module.exports = (model, field = "customerId") => {
  return async (req, res, next) => {
    const resource = await model.findById(req.params.id);
    if (!resource)
      return res.status(404).json({ msg: "Resource not found" });

    if (resource[field].toString() !== req.user.id)
      return res.status(403).json({ msg: "Not authorized" });

    next();
  };
};
