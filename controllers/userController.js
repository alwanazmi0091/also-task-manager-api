import UserService from "../services/UserService.js";

const loginController = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserService.login(email, password);

  await new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  req.session.userId = user.user_id;

  await new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  return res.status(200).json({
    message: "Logged in successfully",
    user,
  });
};

const registerController = async (req, res) => {
  const { email, name, password } = req.body;
  const result = await UserService.register({ email, name, password });
  return res.status(201).json({
    message: "User created successfully",
    createdId: result,
  });
};

const fetchUserController = async (req, res) => {
  const id = req.session.userId;
  const user = await UserService.fetchUser(id);
  return res.status(200).json(user);
};

const editUserController = async (req, res) => {
  const id = req.session.userId;
  await UserService.edit(id, req.body);
  return res.status(204).send();
};

const deleteUserController = async (req, res) => {
  const id = req.session.userId;
  await UserService.delete(id);

  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  res.clearCookie("sessionId", {
    sameSite: "lax",
    httpOnly: true,
    secure: false,
  });

  return res.status(204).send();
};

const logoutController = async (req, res) => {
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  res.clearCookie("sessionId", {
    sameSite: "lax",
    httpOnly: true,
    secure: false,
  });

  return res.status(204).send();
};

export {
  loginController,
  registerController,
  fetchUserController,
  editUserController,
  deleteUserController,
  logoutController,
};
